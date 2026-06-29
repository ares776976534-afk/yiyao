import styles from './index.module.css';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { MultilingualCheckMarkIcon } from '@/components/Icon';
import { useState, useEffect } from 'react';
import { getUserInfo, checkAuthAndLogin, logout } from '@/utils/login';
import { useNavigate } from 'ice';
import DropDownContent from '@/components/AgentLayout/components/DropDownContent';
import UsercenterModal from '@/components/AgentLayout/components/UsercenterModal';
import { defaultUserImg } from '@/utils/env';
import { useChatHistory } from '@/pages/select-product/components/ChatHistory/useChatHistory';
import { $t } from '@/i18n';
import DropdownLanguage from './DropdownLanguage';
import { LANGUAGE_OPTIONS } from '@/i18n/constants';
import { useStore } from '@/stores/context';
import { StoreProvider } from '@/stores/context';
import { storeServices } from '@/services/studio/storeServices';
import MobileModal from '@/pages/mobile/components/mobileModal';

type TypeLanguageSettingsProps = {
  type?: string;
};

const LanguageSettings = ({ type }: TypeLanguageSettingsProps) => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [selected, setSelected] = useState('account');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { shareCode } = useChatHistory();
  const store = useStore();
  const { preferences } = store.userPrefer;
  const navigate = useNavigate();
  const currentLanguage = preferences?.common?.language;

  const [selectedLanguage, setSelectedLanguage] = useState(
    LANGUAGE_OPTIONS.find((item) => item.value === currentLanguage) || LANGUAGE_OPTIONS[0],
  );

  useEffect(() => {
    setSelectedLanguage(
      LANGUAGE_OPTIONS.find((item) => item.value === currentLanguage) || LANGUAGE_OPTIONS[0],
    );
  }, [currentLanguage]);

  const handleLanguageChange = ({ key }: { key: string }) => {
    const selectedItem = LANGUAGE_OPTIONS.find(item => item.value === key);
    if (selectedItem) {
      store.userPrefer.updateLanguage(selectedItem.value);
    }
  };
  const items: MenuProps['items'] = LANGUAGE_OPTIONS.map(option => ({
    label: (
      <div className={styles.languageSettingsItemLabel}>
        <div
          style={{
            color: 'var(--text-primary)',
            fontWeight: selectedLanguage?.value === option.value ? 500 : 'normal',
            flex: 1,
          }}
        >
          {option.label}
        </div>
        {selectedLanguage?.value === option.value && <MultilingualCheckMarkIcon />}
      </div>
    ),
    key: option.value,
    className: selectedLanguage?.value === option.value ? 'selected-item' : '',
  }));

  const handleLogin = () => {
    checkAuthAndLogin({
      type,
      onSuccess: () => {
        window.location.reload();
      },
    }).then((result) => {
      if (result) {
        getUserInfo().then((user) => {
          setUserInfo(user);
        });
      }
    });
  };

  useEffect(() => {
    if (shareCode) {
      return;
    }

    getUserInfo().then((user) => {
      setUserInfo(user);
    });
    // handleLogin();
  }, []);

  const itemClick = (key: string, { data }: any) => {
    if (key === 'logout') {
      logout();
      return;
    }
    const { path, target } = data || {};

    if (path) {
      if (target) {
        window.open(path, target);
      } else {
        navigate(path);
      }
    } else {
      setSelected(key);
      setIsModalOpen(true);
    }

    setDropdownVisible(false);
  };

  return (
    <div className={styles.languageSettingsContainer}>
      <DropdownLanguage items={items} handleLanguageChange={handleLanguageChange} selectedLanguage={selectedLanguage} />
      {/* <Dropdown
        menu={{ items, onClick: handleLanguageChange }}
        trigger={['click']}
        overlayClassName="language-dropdown-overlay"
      >
        <div className={styles.languageSettingsItem}>
          <CountryIcon color="#1D1E29" />
          <div className={styles.languageSettingsItemText}>
            <span>{selectedLanguage.label}</span>
            <DownArrowIcon />
          </div>
        </div>
      </Dropdown> */}
      <div className={styles.languageSettingsItemImage}>
        {userInfo?.loginId ? (
          <Dropdown
            trigger={type === 'mobile' ? ['click'] : ['hover']}
            open={type === 'mobile' ? dropdownVisible : undefined}
            onOpenChange={(open) => {
              if (type === 'mobile') {
                setDropdownVisible(open);
              }
            }}
            popupRender={() => (
              <DropDownContent
                type={type}
                userInfo={userInfo}
                itemClick={(key, menuInfo) => itemClick(key, menuInfo)}
              />
            )}
            placement="bottomLeft"
          >
            <img
              className={styles.languageSettingsItemImageIcon}
              src={userInfo?.userImg || defaultUserImg}
              alt=""
              srcSet=""
              onClick={() => {
                if (type === 'mobile') {
                  setDropdownVisible(!dropdownVisible);
                }
              }}
            />
          </Dropdown>
        ) : (
          <div className={styles.languageSettingsLoginButton} onClick={handleLogin}>
            {$t("global-1688-ai-app.ChatFlow.LanguageSettings.immediatelyLogin", "立即登录")}
          </div>
        )}
      </div>
      {type === 'mobile' ? (
        <MobileModal
          selected={selected}
          isModalOpen={isModalOpen}
          handleCancel={() => {
            setIsModalOpen(false);
          }}
        />
      ) : (
        <UsercenterModal
          selected={selected}
          isModalOpen={isModalOpen}
          handleCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default (props) => {
  return (
    <StoreProvider services={storeServices}>
      <LanguageSettings {...props} />
    </StoreProvider>
  );
};