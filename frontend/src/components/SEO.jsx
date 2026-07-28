import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description }) {
  const defaultTitle = "CleanReport — Report It. Track It. Clean It.";
  const defaultDescription = "Report sanitation issues in your community seamlessly with CleanReport.";
  
  return (
    <Helmet>
      <title>{title ? `${title} | CleanReport` : defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta property="og:title" content={title ? `${title} | CleanReport` : defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta name="twitter:title" content={title ? `${title} | CleanReport` : defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
    </Helmet>
  );
}
