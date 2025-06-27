'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadReport } from './actions';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
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
        // Clear the form
        const fileInput = document.getElementById('pdf-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setFile(null);
        setSelectedMonth('');

      } else {
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
      toast({
        title: 'Đã xảy ra lỗi bất ngờ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg animate-in fade-in-50 duration-500">
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
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
