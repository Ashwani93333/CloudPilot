import React from 'react';
import { SquircleIcon } from './SquircleIcon';

export const BrandMarquee: React.FC = () => {
  const brands = [
    { name: 'AmazonEC2', title: 'EC2 Elastic Compute' },
    { name: 'AmazonRDS', title: 'Amazon Relational Database' },
    { name: 'AmazonS3', title: 'Amazon Simple Storage' },
    { name: 'AWSLambda', title: 'AWS Lambda Serverless' },
    { name: 'CloudWatch', title: 'CloudWatch Telemetry' },
    { name: 'AmazonVPC', title: 'Virtual Private Cloud' },
    { name: 'IAMSecurity', title: 'Identity & Access Management' },
  ];

  return (
    <div className="w-full overflow-hidden py-4 border-y border-hairline-soft bg-canvas">
      <div className="flex items-center space-x-8 animate-none overflow-x-auto no-scrollbar px-6 md:justify-center">
        {brands.map((brand) => (
          <div
            key={brand.name}
            className="flex items-center space-x-3 px-4 py-2 rounded-full bg-canvas-soft flex-shrink-0"
          >
            <SquircleIcon name={brand.name} size="sm" />
            <span className="text-sm font-semibold text-ink">{brand.name}</span>
            <span className="text-xs text-text-muted hidden md:inline">
              · {brand.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

