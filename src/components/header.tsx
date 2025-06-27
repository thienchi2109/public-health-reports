import Link from "next/link";
import { BarChart3, Shield } from "lucide-react";

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span>Trình Quản lý Infographic</span>
            </Link>
          </div>
          <nav>
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span>Bảng điều khiển</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
