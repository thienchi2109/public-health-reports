'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadReport, loadAllReports, deleteReport } from './actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, Loader2, Trash2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { ReportData } from '@/types/report-data';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [existingReports, setExistingReports] = useState<Record<string, ReportData>>({});
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const { toast } = useToast();

  // Load existing reports on component mount
  useEffect(() => {
    const loadReports = async () => {
      try {
        const reports = await loadAllReports();
        setExistingReports(reports);
      } catch (error) {
        console.error('Error loading reports:', error);
        toast({
          title: 'Lỗi tải dữ liệu',
          description: 'Không thể tải danh sách báo cáo hiện có.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingReports(false);
      }
    };
    
    loadReports();
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
    setUploadSuccess(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: 'Chưa chọn tệp',
        description: 'Vui lòng chọn một tệp PDF để tải lên.',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedMonth) {
      toast({
        title: 'Chưa chọn tháng',
        description: 'Vui lòng chọn tháng cho báo cáo.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append('pdf-file', file);
    formData.append('month', selectedMonth);

    try {
      const result = await uploadReport(formData);
      if (result.success) {
        toast({
          title: 'Thành công!',
          description: result.message,
        });
        setUploadSuccess(true);
        // Reload reports to show the new one
        const updatedReports = await loadAllReports();
        setExistingReports(updatedReports);
        // Clear the form
        const fileInput = document.getElementById('pdf-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setFile(null);
        setSelectedMonth('');
      } else {
        setUploadSuccess(false);
        toast({
          title: 'Xử lý Thất bại',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
       let message = 'Đã xảy ra lỗi không mong muốn.';
       if (error instanceof Error) {
        message = error.message;
       }
       setUploadSuccess(false);
      toast({
        title: 'Đã xảy ra lỗi bất ngờ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteReport = async (month: string) => {
    try {
      const result = await deleteReport(month);
      if (result.success) {
        toast({
          title: 'Xóa thành công!',
          description: result.message,
        });
        // Reload reports to remove the deleted one
        const updatedReports = await loadAllReports();
        setExistingReports(updatedReports);
      } else {
        toast({
          title: 'Xóa thất bại',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Đã xảy ra lỗi',
        description: 'Không thể xóa báo cáo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Card */}
          <Card className="animate-in fade-in-50 duration-500">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Tải lên Báo cáo PDF</CardTitle>
                <CardDescription>
                  Chọn một báo cáo PDF của một tháng để thêm vào cơ sở dữ liệu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                   <div className="space-y-1.5">
                      <Label htmlFor="month">Chọn tháng cho báo cáo</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isProcessing}>
                        <SelectTrigger id="month" aria-label="Chọn tháng">
                          <SelectValue placeholder="Chọn tháng..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={`Tháng ${i + 1}`}>
                              Tháng {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pdf-file">Tệp PDF</Label>
                    <Input
                      id="pdf-file"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" asChild>
                  <Link href="/">Hủy</Link>
                </Button>
                <div className="flex gap-2">
                  {uploadSuccess && (
                    <Button asChild variant="default">
                      <Link href="/">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Trực quan hóa dữ liệu
                      </Link>
                    </Button>
                  )}
                  <Button type="submit" disabled={isProcessing || !file || !selectedMonth}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" />
                        Tải lên & Xử lý
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Existing Reports Card */}
          <Card className="animate-in fade-in-50 duration-500">
            <CardHeader>
              <CardTitle>Báo cáo hiện có</CardTitle>
              <CardDescription>
                Quản lý các báo cáo đã được tải lên và xử lý.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : Object.keys(existingReports).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có báo cáo nào được tải lên.
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.keys(existingReports).map((month) => (
                    <div key={month} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{month}</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa báo cáo {month}? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteReport(month)}>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {Object.keys(existingReports).length > 0 && (
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Xem tất cả báo cáo
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
