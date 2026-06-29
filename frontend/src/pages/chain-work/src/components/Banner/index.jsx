import React from 'react';
import {
  Slider,
} from '@alifd/next';
import configCenter from '@alife/channel-uni-config-center';
import './index.scss';

class Banner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      banner: [],
      show: false,
    };
  }

  componentDidMount() {
    const {
      resourceId,
    } = this.props;
    resourceId && this.getBannerData(resourceId);
  }

  getBannerData = (resourceId) => {
    configCenter.getByResourceId(resourceId)
      .then((_res) => {
        const res = _res[0] || _res || {};
        if (res && res.data && res.data.length) {
          this.setState({
            banner: res.data,
            show: true,
          });
        }
      });
  };

  render() {
    const {
      banner,
      show,
    } = this.state;
    const {
      style,
    } = this.props;
    return (banner && banner.length) ? (
      <div className="banner" style={{ ...style }}>
        <Slider autoplay autoplaySpeed={3000} dots={false} fade={!show}>
          {
            banner.map((item, i) => {
              return (
                item.link?.length ?
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    className="banner-a"
                    rel="noreferrer"
                    data-channel-uni-logger-action-type={`CLK_Banner_Url_${item.link}`}
                  >
                    <img src={item.imgUrl} className="banner-img" />
                  </a> : <img src={item.imgUrl} className="banner-img" />
              );
            })
          }
        </Slider>
      </div>
    ) : null;
  }
}

export default Banner;
