from rest_framework import serializers
from .models import ExporterProfile, Deal, BatchMatch
from suppliers.serializers import ProductBatchSerializer
from buyers.serializers import BuyerRequirementSerializer

class ExporterProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = ExporterProfile
        fields = ['id', 'username', 'email', 'company_name', 'license_number', 
                  'phone', 'address', 'created_at']

class DealSerializer(serializers.ModelSerializer):
    exporter_name = serializers.CharField(source='exporter.username', read_only=True)
    buyer_requirement = BuyerRequirementSerializer(read_only=True)
    product_batch = ProductBatchSerializer(read_only=True)
    
    class Meta:
        model = Deal
        fields = ['id', 'exporter', 'exporter_name', 'buyer_requirement', 
                  'product_batch', 'status', 'quantity', 'total_price', 
                  'notes', 'created_at', 'updated_at']
        read_only_fields = ['exporter', 'created_at', 'updated_at']

class BatchMatchSerializer(serializers.ModelSerializer):
    batch = ProductBatchSerializer(read_only=True)
    requirement = BuyerRequirementSerializer(read_only=True)
    
    class Meta:
        model = BatchMatch
        fields = ['id', 'batch', 'requirement', 'match_score', 
                  'is_compatible', 'match_details', 'created_at']