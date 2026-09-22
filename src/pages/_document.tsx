import Document, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from 'next/document';

type LocalizedDocumentProps = DocumentInitialProps & {
  locale: 'en' | 'bm' | 'cn';
};

export default class LocalizedDocument extends Document<LocalizedDocumentProps> {
  static async getInitialProps(context: DocumentContext): Promise<LocalizedDocumentProps> {
    const initialProps = await Document.getInitialProps(context);
    const requestedLocale = context.query.locale;
    const locale = requestedLocale === 'bm' || requestedLocale === 'cn' ? requestedLocale : 'en';

    return { ...initialProps, locale };
  }

  render() {
    const { locale } = this.props;

    return (
      <Html lang={locale === 'bm' ? 'ms' : locale === 'cn' ? 'zh-Hans' : 'en'}>
        <Head>
          {/* Google Tag Manager */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TGL5NW4G');`,
            }}
          />
          {/* End Google Tag Manager */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=AW-10860340363" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-10860340363');
              `,
            }}
          />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Inter:400,500,600,700,800,900|Plus+Jakarta+Sans:400,500,600,700,800,900&amp;subset=latin&amp;display=swap"
            media="print"
            onLoad={(event) => {
              event.currentTarget.media = 'all';
            }}
          />
          <noscript>
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css?family=Inter:400,500,600,700,800,900|Plus+Jakarta+Sans:400,500,600,700,800,900&amp;subset=latin&amp;display=swap"
            />
          </noscript>
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/junior-lee-favicon.png"
          />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0E6656" />
          <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js" defer />
        </Head>
        <body className="antialiased bg-body text-body font-body">
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-TGL5NW4G"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
          {/* End Google Tag Manager (noscript) */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
