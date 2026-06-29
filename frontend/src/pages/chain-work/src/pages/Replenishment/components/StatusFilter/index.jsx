import React, { useEffect, useState } from 'react';
import { getStatus } from '../../services/status';

import './index.scss';

function StatusFilter({ onChange = () => { }, reload = false }) {
  const [list, setList] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    getData()
      .then((data) => {
        handleChange(null, data[0]?.subStatusList[0]);
      });
  }, []);

  const handleChange = (e, data) => {
    e && e.stopPropagation();
    if (active === data?.code) return;
    setActive(data?.code);
    onChange(data?.code);
  };

  const handleClickStatusBlock = (e, data) => {
    e.stopPropagation();
    handleChange(null, data?.subStatusList[0]);
  };

  const getData = () => {
    return getStatus()
      .then((data) => {
        setList(data);
        return data;
      });
  };

  useEffect(() => {
    if (reload) getData();
  }, [reload]);

  return (
    <div className="statusFilter">
      <div className="statusFilter-wrap">
        {
          list?.map((item) => {
            const isActive = item.subStatusList.findIndex((sub) => sub.code === active) > -1;
            return (
              <div key={item.name} className={`statusFilter-item ${isActive ? 'active' : ''}`} onClick={(e) => handleClickStatusBlock(e, item)}>
                <div className="statusFilter-item-name">
                  {item.name}
                </div>
                <div className="statusFilter-item-status">
                  {
                    item.subStatusList.map((subStatus) => {
                      const isSubActive = subStatus.code === active;
                      return (
                        <span
                          key={subStatus.code}
                          className={`statusFilter-item-status-text ${isSubActive ? 'active' : ''}`}
                          onClick={(e) => handleChange(e, subStatus)}
                        >
                          {subStatus.name}&nbsp;{subStatus.quantity || 0}
                        </span>
                      );
                    })
                  }
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default StatusFilter;
