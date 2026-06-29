import { getVersionComponent } from '@/utils/versionRouter';

const cn = () => {
  return (
    <div className="h-[30px] w-[70px] box-content">
      <img
        src="https://img.alicdn.com/imgextra/i1/O1CN01ljVurb1imRZuBSkWW_!!6000000004455-2-tps-210-90.png"
        alt=""
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  ); 
}

const global = () => {
  return (
    <div className='w-[146px] h-[20px]'>
      <img
        src="https://img.alicdn.com/imgextra/i3/O1CN01vSQK9A1pW8nX9iSos_!!6000000005367-2-tps-293-40.png"
        alt=""
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}

export default getVersionComponent({
  CN: cn,
  GLOBAL: global,
});

