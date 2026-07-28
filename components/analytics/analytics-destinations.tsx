import Script from "next/script";

export function AnalyticsDestinations() {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){dataLayer.push(arguments);};
          (function(){
            var choice = null;
            try { choice = window.localStorage.getItem('helena.analytics.consent.v1'); } catch (_) {}
            window.gtag('consent', 'default', {
              ad_personalization: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              analytics_storage: choice === 'accepted' ? 'granted' : 'denied',
              wait_for_update: 500
            });
          })();
        `,
        }}
        id="helena-consent-default"
      />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="helena-ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function(){dataLayer.push(arguments);}
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
