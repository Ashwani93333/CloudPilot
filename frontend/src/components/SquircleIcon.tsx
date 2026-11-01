import React from 'react';
import {
  Server,
  Database,
  HardDrive,
  Zap,
  Activity,
  Layers,
  Shield,
  Network
} from 'lucide-react';

interface SquircleIconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SquircleIcon: React.FC<SquircleIconProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const iconSizeMap = {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 28,
  };

  const getServiceVisuals = (serviceName: string) => {
    const s = serviceName.toLowerCase();
    if (s.includes('ec2') || s.includes('compute')) {
      return {
        bg: 'bg-[#ff9900]/10 text-[#d97706]',
        icon: <Server size={iconSizeMap[size]} strokeWidth={2} />,
      };
    }
    if (s.includes('rds') || s.includes('database')) {
      return {
        bg: 'bg-[#3b82f6]/10 text-[#2563eb]',
        icon: <Database size={iconSizeMap[size]} strokeWidth={2} />,
      };
    }
    if (s.includes('s3') || s.includes('storage')) {
      return {
        bg: 'bg-[#10b981]/10 text-[#059669]',
        icon: <HardDrive size={iconSizeMap[size]} strokeWidth={2} />,
      };
    }
    if (s.includes('lambda') || s.includes('serverless')) {
      return {
        bg: 'bg-[#f43f5e]/10 text-[#e11d48]',
        icon: <Zap size={iconSizeMap[size]} strokeWidth={2} />,
      };
    }
    if (s.includes('cloudwatch') || s.includes('monitor')) {
      return {
        bg: 'bg-[#8b5cf6]/10 text-[#7c3aed]',
        icon: <Activity size={iconSizeMap[size]} strokeWidth={2} />,
      };
    }
    if (s.includes('iam') || s.includes('security')) {
      return {
        bg: 'bg-[#64748b]/10 text-[#475569]',
        icon: <Shield size={iconSizeMap[size]} strokeWidth={2} />,
      };
    }
    if (s.includes('vpc') || s.includes('network')) {
      return {
        bg: 'bg-[#06b6d4]/10 text-[#0891b2]',
        icon: <Network size={iconSizeMap[size]} strokeWidth={2} />,
      };
    }
    return {
      bg: 'bg-canvas-soft text-ink',
      icon: <Layers size={iconSizeMap[size]} strokeWidth={2} />,
    };
  };

  const visuals = getServiceVisuals(name);

  return (
    <div
      className={`app-icon-squircle border border-hairline-soft ${sizeMap[size]} ${visuals.bg} ${className}`}
      title={name}
      style={{ borderRadius: '30%' }}
    >
      {visuals.icon}
    </div>
  );
};
