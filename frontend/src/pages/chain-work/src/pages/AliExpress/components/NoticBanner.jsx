import React, { useState, useEffect } from 'react';
import { getResourceById } from '@/utlis';
import { Slider } from '@alifd/next';

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getResourceById(37746680)
      .then((res) => {
        setData(res);
      });
  }, []);
  return (
    <div className="w-[300px] h-[96px] bg-[#FFF] rounded-[6px]">
      <Slider
        autoplay
        dots={false}
      >
        {data.map((item) => {
          return (
            <a key={item.img} href={item.link} target="_blank" className="w-[300px] h-[100px] rounded-[6px]" rel="noreferrer">
              <img className="w-full h-full rounded-[6px]" src={item.img} />
            </a>
          );
        })}
      </Slider>
    </div>
  );
};
