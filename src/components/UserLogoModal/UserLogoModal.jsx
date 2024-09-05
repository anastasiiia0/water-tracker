import { useState, useEffect, useCallback } from "react";
import Icon from "../Icon/Icon";
import css from "./UserLogoModal.module.css";
import SettingModal from "../SettingModal/SettingModal";
import UserLogoutModal from "../UserLogoutModal/UserLogoutModal";

const UserLogoModal = ({ toggleModal }) => {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const openSettingModal = () => {
    setIsLogoutModalOpen(false);
    setIsSettingModalOpen(true);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeAllModals = useCallback(() => {
    setIsSettingModalOpen(false);
    setIsLogoutModalOpen(false);
    toggleModal();
  }, [toggleModal]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        closeAllModals();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [closeAllModals]);

  return (
    <div className={css.modal} onClick={closeAllModals}>
      {!isSettingModalOpen && !isLogoutModalOpen && (
        <div className={css.modalContent} onClick={(e) => e.stopPropagation()}>
          <button onClick={openSettingModal} className={css.button}>
            <Icon id="cogwheel" width={24} height={24} className="icon-blue" />
            <span className={css.buttonText}>Settings</span>
          </button>
          <button onClick={openLogoutModal} className={css.button}>
            <Icon id="arrow-up" width={24} height={24} className="icon-blue" />
            <span className={css.buttonText}>Log out</span>
          </button>
        </div>
      )}
      {isSettingModalOpen && (
        <SettingModal
          isOpen={isSettingModalOpen}
          onClose={() => {
            setIsSettingModalOpen(false);
            closeAllModals();
          }}
          toggleModal={closeAllModals}
        />
      )}
      {isLogoutModalOpen && (
        <UserLogoutModal
          onClose={() => {
            setIsLogoutModalOpen(false);
            closeAllModals();
          }}
          toggleModal={closeAllModals}
        />
      )}
    </div>
  );
};

export default UserLogoModal;
