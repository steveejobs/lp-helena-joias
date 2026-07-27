import Script from "next/script";

export function AnalyticsDestinations() {
  const measurementId = (
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
    ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  )?.trim();
  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="helena-ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){dataLayer.push(arguments);}
          window.gtag('js', new Date());
          window.gtag('config', '${measurementId}', {
            anonymize_ip: true,
            send_page_view: false
          });
        `}
      </Script>
    </>
  );
}
