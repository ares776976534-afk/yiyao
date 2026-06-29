import DataBoard from '@/components/ChatFlow/DataBoard';

interface TypeProductInfoProps {
  className?: string;
  platform?: string;
  title?: string | React.ReactNode;
  data?: any;
  open?: boolean;
}

export default function ProductInfo({
  className,
  platform,
  title,
  data = [],
  open,
}: TypeProductInfoProps) {
  return (
    <div className={`flex flex-col flex-wrap ${className}`}>
      <div className="text-[14px] font-medium leading-[20px]" style={{ color: 'var(--text-primary)' }}>
        {title}
      </div>
      <DataBoard data={data} platform={platform} open={open} />
    </div>
  );
}
