from django.db import models
from django.contrib.auth.models import User
from suppliers.models import ProductBatch
from buyers.models import BuyerRequirement

class ExporterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='exporter_profile')
    company_name = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100, unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.company_name} - {self.user.username}"

class Deal(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('buyer_approved', 'Buyer Approved'),
        ('documents_generated', 'Documents Generated'),
        ('payment_processing', 'Payment Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    exporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deals')
    buyer_requirement = models.ForeignKey(BuyerRequirement, on_delete=models.CASCADE)
    product_batch = models.ForeignKey(ProductBatch, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Deal #{self.id} - {self.exporter.username} - {self.status}"

class BatchMatch(models.Model):
    """Stores matching results between batches and requirements"""
    batch = models.ForeignKey(ProductBatch, on_delete=models.CASCADE)
    requirement = models.ForeignKey(BuyerRequirement, on_delete=models.CASCADE)
    match_score = models.IntegerField(default=0)  # 0-100 compatibility score
    is_compatible = models.BooleanField(default=False)
    match_details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['batch', 'requirement']
    
    def __str__(self):
        return f"Match: Batch {self.batch.id} - Req {self.requirement.id} ({self.match_score}%)"