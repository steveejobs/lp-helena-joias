import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-shell">
      <StoreHeader />
      {children}
      <StoreFooter />
    </div>
  );
}
