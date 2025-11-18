from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ExporterProfile, Deal, BatchMatch
from .serializers import ExporterProfileSerializer, DealSerializer, BatchMatchSerializer
from suppliers.models import ProductBatch
from buyers.models import BuyerRequirement

class ExporterProfileViewSet(viewsets.ModelViewSet):
    queryset = ExporterProfile.objects.all()
    serializer_class = ExporterProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ExporterProfile.objects.filter(user=self.request.user)

class MarketplaceViewSet(viewsets.ReadOnlyModelViewSet):
    """View available batches and requirements"""
    queryset = ProductBatch.objects.filter(qc_status='passed')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from suppliers.serializers import ProductBatchSerializer
        return ProductBatchSerializer
    
    @action(detail=False, methods=['get'])
    def requirements(self, request):
        """Get all active buyer requirements"""
        requirements = BuyerRequirement.objects.filter(status='active')
        from buyers.serializers import BuyerRequirementSerializer
        serializer = BuyerRequirementSerializer(requirements, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def match_batches(self, request):
        """Find compatible batches for a requirement"""
        requirement_id = request.data.get('requirement_id')
        
        try:
            requirement = BuyerRequirement.objects.get(id=requirement_id)
        except BuyerRequirement.DoesNotExist:
            return Response({'error': 'Requirement not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Get all passed batches
        batches = ProductBatch.objects.filter(qc_status='passed')
        
        matches = []
        for batch in batches:
            match_score, is_compatible, details = self._calculate_match(batch, requirement)
            
            if is_compatible:
                match, created = BatchMatch.objects.get_or_create(
                    batch=batch,
                    requirement=requirement,
                    defaults={
                        'match_score': match_score,
                        'is_compatible': is_compatible,
                        'match_details': details
                    }
                )
                matches.append(match)
        
        serializer = BatchMatchSerializer(matches, many=True)
        return Response(serializer.data)
    
    def _calculate_match(self, batch, requirement):
        """Calculate compatibility score between batch and requirement"""
        score = 0
        details = {}
        
        # Check product type
        if batch.product_name.lower() == requirement.product_type.lower():
            score += 30
            details['product_match'] = True
        else:
            details['product_match'] = False
        
        # Check quantity
        if batch.quantity >= requirement.quantity:
            score += 30
            details['quantity_sufficient'] = True
        else:
            details['quantity_sufficient'] = False
        
        # Check contamination levels (simplified)
        qc_data = batch.qc_results or {}
        req_thresholds = requirement.contamination_thresholds or {}
        
        contaminant_pass = True
        for contaminant, threshold in req_thresholds.items():
            batch_level = qc_data.get(contaminant, 0)
            if batch_level > threshold:
                contaminant_pass = False
                break
        
        if contaminant_pass:
            score += 40
            details['contamination_pass'] = True
        else:
            details['contamination_pass'] = False
        
        is_compatible = score >= 60  # Must score at least 60% to be compatible
        
        return score, is_compatible, details

class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all()
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Deal.objects.filter(exporter=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(exporter=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update deal status"""
        deal = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Deal.STATUS_CHOICES):
            deal.status = new_status
            deal.save()
            return Response({'status': 'Deal status updated'})
        
        return Response({'error': 'Invalid status'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def generate_documents(self, request, pk=None):
        """Generate export documents"""
        deal = self.get_object()
        
        if deal.status != 'buyer_approved':
            return Response({'error': 'Deal must be buyer approved first'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Generate document data (simplified)
        documents = {
            'commercial_invoice': self._generate_invoice(deal),
            'certificate_of_origin': self._generate_coo(deal),
            'health_certificate': self._generate_health_cert(deal)
        }
        
        deal.status = 'documents_generated'
        deal.save()
        
        return Response(documents)
    
    def _generate_invoice(self, deal):
        return {
            'type': 'Commercial Invoice',
            'deal_id': deal.id,
            'exporter': deal.exporter.username,
            'buyer': deal.buyer_requirement.buyer.username,
            'product': deal.product_batch.product_name,
            'quantity': str(deal.quantity),
            'total_price': str(deal.total_price),
            'date': deal.created_at.strftime('%Y-%m-%d')
        }
    
    def _generate_coo(self, deal):
        return {
            'type': 'Certificate of Origin',
            'deal_id': deal.id,
            'origin_country': 'Indonesia',
            'product': deal.product_batch.product_name,
            'batch_number': deal.product_batch.batch_number
        }
    
    def _generate_health_cert(self, deal):
        return {
            'type': 'Health Certificate',
            'deal_id': deal.id,
            'product': deal.product_batch.product_name,
            'qc_status': deal.product_batch.qc_status,
            'qc_results': deal.product_batch.qc_results
        }