#!/usr/bin/env python3
"""
Script to extract all toast messages and create translation keys
"""
import re
import json
import os
from collections import defaultdict

# Paths
pages_dir = "/home/ubuntu/sari/client/src/pages"
ar_json_path = "/home/ubuntu/sari/client/src/locales/ar.json"
en_json_path = "/home/ubuntu/sari/client/src/locales/en.json"

# Toast message translations
toast_translations = {
    # Products
    'تم إضافة المنتج بنجاح': 'Product added successfully',
    'فشل إضافة المنتج': 'Failed to add product',
    'تم تحديث المنتج بنجاح': 'Product updated successfully',
    'فشل تحديث المنتج': 'Failed to update product',
    'تم حذف المنتج بنجاح': 'Product deleted successfully',
    'فشل حذف المنتج': 'Failed to delete product',
    'يرجى إدخال اسم المنتج والسعر': 'Please enter product name and price',
    
    # Orders
    'تم تحديث حالة الطلب بنجاح': 'Order status updated successfully',
    'تم تحديث حالة الطلب': 'Order status updated',
    'فشل تحديث حالة الطلب': 'Failed to update order status',
    'فشل تحديث الحالة': 'Failed to update status',
    'تم إلغاء الطلب': 'Order cancelled',
    'فشل إلغاء الطلب': 'Failed to cancel order',
    
    # Campaigns
    'تم إنشاء الحملة بنجاح': 'Campaign created successfully',
    'فشل إنشاء الحملة': 'Failed to create campaign',
    'تم حذف الحملة بنجاح': 'Campaign deleted successfully',
    'فشل حذف الحملة': 'Failed to delete campaign',
    'تم بدء إرسال الحملة بنجاح': 'Campaign sending started successfully',
    'فشل إرسال الحملة': 'Failed to send campaign',
    'يرجى إدخال اسم الحملة': 'Please enter campaign name',
    'يرجى إدخال نص الرسالة': 'Please enter message text',
    'تم تحديث حالة الحملة بنجاح': 'Campaign status updated successfully',
    
    # Conversations
    'تم رفع التسجيل بنجاح': 'Recording uploaded successfully',
    'فشل رفع التسجيل': 'Failed to upload recording',
    'تم إلغاء التسجيل': 'Recording cancelled',
    
    # Discount Codes
    'تم إنشاء كود الخصم بنجاح': 'Discount code created successfully',
    'فشل إنشاء كود الخصم': 'Failed to create discount code',
    'تم تحديث كود الخصم': 'Discount code updated',
    'فشل تحديث كود الخصم': 'Failed to update discount code',
    'تم حذف كود الخصم': 'Discount code deleted',
    'فشل حذف كود الخصم': 'Failed to delete discount code',
    'يرجى ملء جميع الحقول المطلوبة': 'Please fill all required fields',
    
    # WhatsApp
    'تم إرسال طلب الربط بنجاح': 'Connection request sent successfully',
    'فشل إرسال الطلب': 'Failed to send request',
    'الرجاء إدخال رقم الهاتف': 'Please enter phone number',
    'رقم الهاتف غير صحيح': 'Invalid phone number',
    'تم ربط واتساب بنجاح!': 'WhatsApp connected successfully!',
    'تم إرسال الطلب بنجاح! سيتم مراجعته قريباً': 'Request sent successfully! Will be reviewed soon',
    'تم تحديث الكود': 'Code updated',
    
    # Settings
    'تم تحديث معلومات الحساب بنجاح': 'Account information updated successfully',
    'فشل تحديث معلومات الحساب': 'Failed to update account information',
    'تم تحديث معلومات المتجر بنجاح': 'Store information updated successfully',
    'فشل تحديث معلومات المتجر': 'Failed to update store information',
    'الاسم مطلوب': 'Name is required',
    'اسم المتجر مطلوب': 'Store name is required',
    
    # Subscriptions
    'أنت مشترك بالفعل في هذه الباقة': 'You are already subscribed to this plan',
    'الرجاء اختيار طريقة الدفع': 'Please select payment method',
    
    # Abandoned Carts
    'تم إرسال رسالة التذكير بنجاح': 'Reminder message sent successfully',
    'تم تحديث حالة السلة بنجاح': 'Cart status updated successfully',
    
    # WhatsApp Instances
    'تم إضافة Instance بنجاح': 'Instance added successfully',
    'فشل إضافة Instance': 'Failed to add instance',
    'تم تحديث Instance بنجاح': 'Instance updated successfully',
    'فشل تحديث Instance': 'Failed to update instance',
    'تم تعيين Instance كـ Primary': 'Instance set as primary',
    'فشل تعيين Primary': 'Failed to set as primary',
    'تم حذف Instance بنجاح': 'Instance deleted successfully',
    'فشل حذف Instance': 'Failed to delete instance',
    'الاتصال ناجح! الحالة': 'Connection successful! Status',
    'فشل الاتصال': 'Connection failed',
    'فشل اختبار الاتصال': 'Failed to test connection',
    'يرجى إدخال Instance ID و Token': 'Please enter Instance ID and Token',
    
    # Order Notifications
    'تم تفعيل الإشعار': 'Notification enabled',
    'تم تعطيل الإشعار': 'Notification disabled',
    'فشل تحديث الإشعار': 'Failed to update notification',
    'تم حفظ القالب بنجاح': 'Template saved successfully',
    'فشل حفظ القالب': 'Failed to save template',
    
    # Analytics
    'تم تصدير التقرير PDF بنجاح': 'PDF report exported successfully',
    'فشل تصدير PDF': 'Failed to export PDF',
    'تم تصدير التقرير Excel بنجاح': 'Excel report exported successfully',
    'فشل تصدير Excel': 'Failed to export Excel',
    
    # Upload Products
    'تم استيراد': 'Imported',
    'منتج بنجاح': 'products successfully',
    'فشل رفع الملف': 'Failed to upload file',
    'يرجى اختيار ملف CSV فقط': 'Please select CSV file only',
    'يرجى اختيار ملف CSV أولاً': 'Please select CSV file first',
    'فشل قراءة الملف': 'Failed to read file',
    
    # Admin - Merchants
    'تم تحديث حالة التاجر بنجاح': 'Merchant status updated successfully',
    'فشل تحديث حالة التاجر': 'Failed to update merchant status',
    
    # Admin - Settings
    'تم إضافة الباقة بنجاح': 'Plan added successfully',
    'فشل إضافة الباقة': 'Failed to add plan',
    'تم تحديث الباقة بنجاح': 'Plan updated successfully',
    'فشل تحديث الباقة': 'Failed to update plan',
    
    # Admin - WhatsApp Requests
    'تم قبول الطلب بنجاح': 'Request approved successfully',
    'فشل قبول الطلب': 'Failed to approve request',
    'تم رفض الطلب بنجاح': 'Request rejected successfully',
    'تم رفض الطلب': 'Request rejected',
    'فشل رفض الطلب': 'Failed to reject request',
    'الرجاء إدخال سبب الرفض': 'Please enter rejection reason',
    'يرجى إدخال سبب الرفض': 'Please enter rejection reason',
    'تمت الموافقة على الطلب بنجاح': 'Request approved successfully',
    'فشلت الموافقة على الطلب': 'Failed to approve request',
    
    # Admin - Payment Gateways
    'تم حفظ الإعدادات بنجاح': 'Settings saved successfully',
    
    # Salla Integration
    'نجح الربط!': 'Connection successful!',
    'فشل الربط': 'Connection failed',
    'تم الفصل': 'Disconnected',
    'فشل الفصل': 'Failed to disconnect',
    'تمت المزامنة ✅': 'Synced ✅',
    'فشلت المزامنة': 'Sync failed',
    'خطأ': 'Error',
    'يرجى إدخال رابط المتجر والـ Token': 'Please enter store URL and token',
    
    # Support
    'تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت.': 'Your message has been sent successfully! We will reply soon.',
}

def create_toast_key(ar_text):
    """Create a translation key from Arabic text"""
    # Remove special characters and normalize
    key = ar_text.strip()
    
    # Map common patterns to keys
    key_mappings = {
        'تم إضافة': 'added',
        'تم تحديث': 'updated',
        'تم حذف': 'deleted',
        'تم إنشاء': 'created',
        'تم إرسال': 'sent',
        'تم تفعيل': 'enabled',
        'تم تعطيل': 'disabled',
        'تم حفظ': 'saved',
        'تم تصدير': 'exported',
        'تم استيراد': 'imported',
        'تم قبول': 'approved',
        'تم رفض': 'rejected',
        'تم إلغاء': 'cancelled',
        'فشل': 'failed',
        'يرجى': 'please',
        'الرجاء': 'please',
        'المنتج': 'product',
        'الطلب': 'order',
        'الحملة': 'campaign',
        'كود الخصم': 'discount_code',
        'الإشعار': 'notification',
        'القالب': 'template',
        'الباقة': 'plan',
        'التاجر': 'merchant',
        'الحالة': 'status',
        'بنجاح': 'success',
    }
    
    # Simple key generation
    for ar, en in key_mappings.items():
        if ar in key:
            return en
    
    return 'message'

def main():
    print("Extracting toast messages...")
    print("=" * 60)
    
    # Load existing translations
    with open(ar_json_path, 'r', encoding='utf-8') as f:
        ar_data = json.load(f)
    
    with open(en_json_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    
    # Create toast section
    toast_ar = {}
    toast_en = {}
    
    # Organize by category
    categories = {
        'products': [],
        'orders': [],
        'campaigns': [],
        'conversations': [],
        'discounts': [],
        'whatsapp': [],
        'settings': [],
        'subscriptions': [],
        'carts': [],
        'instances': [],
        'notifications': [],
        'analytics': [],
        'upload': [],
        'merchants': [],
        'plans': [],
        'requests': [],
        'gateways': [],
        'salla': [],
        'support': [],
        'common': []
    }
    
    # Categorize messages
    for ar_msg, en_msg in toast_translations.items():
        if 'منتج' in ar_msg or 'Product' in en_msg:
            cat = 'products'
        elif 'طلب' in ar_msg and 'الواتساب' not in ar_msg or 'Order' in en_msg:
            cat = 'orders'
        elif 'حملة' in ar_msg or 'Campaign' in en_msg:
            cat = 'campaigns'
        elif 'تسجيل' in ar_msg or 'Recording' in en_msg:
            cat = 'conversations'
        elif 'كود' in ar_msg or 'Discount' in en_msg or 'code' in en_msg.lower():
            cat = 'discounts'
        elif 'واتساب' in ar_msg or 'WhatsApp' in en_msg:
            cat = 'whatsapp'
        elif 'حساب' in ar_msg or 'متجر' in ar_msg or 'Account' in en_msg or 'Store' in en_msg:
            cat = 'settings'
        elif 'باقة' in ar_msg or 'Plan' in en_msg or 'اشتراك' in ar_msg or 'Subscri' in en_msg:
            cat = 'subscriptions'
        elif 'سلة' in ar_msg or 'Cart' in en_msg:
            cat = 'carts'
        elif 'Instance' in ar_msg or 'Instance' in en_msg:
            cat = 'instances'
        elif 'إشعار' in ar_msg or 'قالب' in ar_msg or 'Notification' in en_msg or 'Template' in en_msg:
            cat = 'notifications'
        elif 'تصدير' in ar_msg or 'PDF' in en_msg or 'Excel' in en_msg:
            cat = 'analytics'
        elif 'رفع' in ar_msg or 'استيراد' in ar_msg or 'CSV' in en_msg or 'upload' in en_msg.lower() or 'import' in en_msg.lower():
            cat = 'upload'
        elif 'تاجر' in ar_msg or 'Merchant' in en_msg:
            cat = 'merchants'
        elif 'Salla' in ar_msg or 'Salla' in en_msg:
            cat = 'salla'
        elif 'رسالة' in ar_msg and 'إرسال' in ar_msg:
            cat = 'support'
        else:
            cat = 'common'
        
        categories[cat].append((ar_msg, en_msg))
    
    # Build toast object
    for cat, messages in categories.items():
        if not messages:
            continue
        
        toast_ar[cat] = {}
        toast_en[cat] = {}
        
        for i, (ar_msg, en_msg) in enumerate(messages, 1):
            # Create simple numeric keys
            key = f"msg{i}"
            toast_ar[cat][key] = ar_msg
            toast_en[cat][key] = en_msg
    
    # Add to main objects
    ar_data['toast'] = toast_ar
    en_data['toast'] = toast_en
    
    # Save updated files
    with open(ar_json_path, 'w', encoding='utf-8') as f:
        json.dump(ar_data, f, ensure_ascii=False, indent=2)
    
    with open(en_json_path, 'w', encoding='utf-8') as f:
        json.dump(en_data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Added {len(toast_translations)} toast messages")
    print(f"✓ Organized into {len([c for c in categories.values() if c])} categories")
    print("=" * 60)
    print("Toast categories:")
    for cat, messages in categories.items():
        if messages:
            print(f"  - {cat}: {len(messages)} messages")
    print("=" * 60)
    print("Done!")

if __name__ == "__main__":
    main()
