/**
 * AdSense Placeholder Component
 * 
 * Replace the placeholder div with your actual Google AdSense code.
 * 
 * To set up Google AdSense:
 * 1. Sign up at https://www.google.com/adsense/
 * 2. Get your publisher ID (ca-pub-xxxxxxxxxxxxxxxx)
 * 3. Create ad units and get their slot IDs
 * 4. Replace the data-ad-client and data-ad-slot values below
 * 
 * Example AdSense code:
 * <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
 *   crossOrigin="anonymous"></script>
 * <ins class="adsbygoogle"
 *   style="display:block"
 *   data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
 *   data-ad-slot="1234567890"
 *   data-ad-format="auto"
 *   data-full-width-responsive="true"></ins>
 * <script>
 *   (adsbygoogle = window.adsbygoogle || []).push({});
 * </script>
 */

interface AdSenseProps {
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

export function AdSense({ format = "auto", className = "" }: AdSenseProps) {
  return (
    <div className={`bg-muted/50 border border-border rounded-lg p-4 ${className}`}>
      <div className="text-xs text-muted-foreground mb-2">Advertisement</div>
      <div
        className="bg-background rounded border border-dashed border-border p-8 text-center text-muted-foreground"
        style={{
          minHeight: format === "vertical" ? "600px" : format === "horizontal" ? "90px" : "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <p className="text-sm">Google AdSense Placeholder</p>
          <p className="text-xs mt-1">Replace with your AdSense code</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal Ad (728x90 or responsive)
 */
export function HorizontalAd({ className = "" }: { className?: string }) {
  return <AdSense format="horizontal" className={className} />;
}

/**
 * Vertical Ad (300x600 or responsive)
 */
export function VerticalAd({ className = "" }: { className?: string }) {
  return <AdSense format="vertical" className={className} />;
}

/**
 * Rectangle Ad (300x250 or responsive)
 */
export function RectangleAd({ className = "" }: { className?: string }) {
  return <AdSense format="rectangle" className={className} />;
}
