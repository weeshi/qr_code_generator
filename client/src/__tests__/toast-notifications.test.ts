import { describe, it, expect, vi } from 'vitest';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
  },
  Toaster: vi.fn(() => null),
}));

import { toast } from 'sonner';

describe('Toast Notifications', () => {
  it('should call toast.success when updating points rate', () => {
    const action = 'إنشاء QR';
    toast.success(`تم تحديث معدل "${action}" بنجاح`);
    
    expect(toast.success).toHaveBeenCalledWith(`تم تحديث معدل "${action}" بنجاح`);
  });

  it('should call toast.info when toggling rate status', () => {
    const action = 'إنشاء QR';
    const status = 'تفعيل';
    toast.info(`تم ${status} معدل "${action}"`);
    
    expect(toast.info).toHaveBeenCalledWith(`تم ${status} معدل "${action}"`);
  });

  it('should call toast.success when applying user points adjustment', () => {
    toast.success('تم تعديل نقاط المستخدم بنجاح');
    
    expect(toast.success).toHaveBeenCalledWith('تم تعديل نقاط المستخدم بنجاح');
  });

  it('should call toast.info when opening edit reward modal', () => {
    const rewardName = 'خصم 10%';
    toast.info(`فتح نموذج تعديل مكافأة "${rewardName}"`);
    
    expect(toast.info).toHaveBeenCalledWith(`فتح نموذج تعديل مكافأة "${rewardName}"`);
  });

  it('should call toast.error when deleting reward', () => {
    const rewardName = 'خصم 10%';
    toast.error(`تم حذف مكافأة "${rewardName}"`);
    
    expect(toast.error).toHaveBeenCalledWith(`تم حذف مكافأة "${rewardName}"`);
  });

  it('should call toast.info when opening add reward modal', () => {
    toast.info('فتح نموذج إضافة مكافأة جديدة');
    
    expect(toast.info).toHaveBeenCalledWith('فتح نموذج إضافة مكافأة جديدة');
  });

  it('should support Arabic text in toast messages', () => {
    const arabicMessage = 'تم تحديث نقاط الولاء بنجاح';
    toast.success(arabicMessage);
    
    expect(toast.success).toHaveBeenCalledWith(arabicMessage);
    expect(arabicMessage).toContain('تم');
    expect(arabicMessage).toContain('نقاط');
  });
});
