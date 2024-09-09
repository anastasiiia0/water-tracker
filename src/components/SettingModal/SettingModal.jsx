import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import Icon from "../Icon/Icon";
import { selectUser } from "../../redux/auth/selectors";
import { useDispatch, useSelector } from "react-redux";
import { updateAvatar, updateUserInfo } from "../../redux/auth/operations";
import css from "./SettingModal.module.css";
import { BaseModal } from "../BaseModal/BaseModal";

const MAX_CHAR_VALIDATION = 64;
const MIN_CHAR_VALIDATION = 8;
const MAX_CHAR_NAME_VALIDATION = 32;

const userSchema = yup.object().shape({
  avatar: yup.mixed(),
  gender: yup.string(),
  userName: yup
    .string()
    .max(
      MAX_CHAR_NAME_VALIDATION,
      `Your name must be less than ${MAX_CHAR_NAME_VALIDATION} characters!`
    ),
  email: yup.string().email("You must enter a valid email address!"),
  currentPassword: yup
    .string()
    .min(
      MIN_CHAR_VALIDATION,
      `Yourcurrent password must be more than ${MIN_CHAR_VALIDATION} characters!`
    )
    .max(
      MAX_CHAR_VALIDATION,
      `Yourcurrent password must be less than ${MAX_CHAR_VALIDATION} characters!`
    ),
  newPassword: yup
    .string()
    .min(
      MIN_CHAR_VALIDATION,
      `Your new password must be more than ${MIN_CHAR_VALIDATION} characters!`
    )
    .max(
      MAX_CHAR_VALIDATION,
      `Your new password must be less than ${MAX_CHAR_VALIDATION} characters!`
    ),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match"),
});

const SettingModal = ({ onClose, isShow }) => {
  const dispatch = useDispatch();
  const userData = useSelector(selectUser);
  const [preview, setPreview] = useState(null);
  const [ShowCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    setPreview(userData.avatar);
  }, [userData]);

  const handleAvatarChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    setFieldValue("avatar", file);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const formData = new FormData();
    formData.append("avatar", file);
    dispatch(updateAvatar(formData))
      .unwrap()
      .then(() => {
        setPreview(previewUrl);
        console.log("Avatar update success");
      })
      .catch((err) => {
        console.log("User updating error", err);
      });
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const { currentPassword, newPassword, ...formData } = values;

      const trimmedCurrentPassword = currentPassword?.trim();
      const trimmedNewPassword = newPassword?.trim();

      if (
        (trimmedCurrentPassword && !trimmedNewPassword) ||
        (!trimmedCurrentPassword && trimmedNewPassword)
      ) {
        console.log(
          "Both currentPassword and newPassword must be filled or left empty."
        );
        return;
      }

      const jsonData = {
        ...Object.fromEntries(
          Object.entries({
            gender: formData.gender?.trim(),
            userName: formData.userName?.trim(),
            email: formData.email?.trim(),
            currentPassword: trimmedCurrentPassword || undefined,
            newPassword: trimmedNewPassword || undefined,
          }).filter(([_, value]) => value !== undefined && value !== "")
        ),
      };
      console.log(jsonData);
      dispatch(updateUserInfo(jsonData))
        .unwrap()
        .then(() => {
          console.log("User update success");
        })
        .catch((err) => {
          console.log("User updating error", err);
        });

      onClose();
      resetForm();
    } catch (error) {
      console.log("Failed to update user data: ", error.message);
    }
  };

  const getAvatarContent = () => {
    if (userData.photo) {
      return (
        <img
          src={userData.photo}
          alt={userData.userName}
          className={css.avatar}
        />
      );
    }
    if (userData.userName) {
      return (
        <span className={css.avatarPlaceholder}>
          {userData.userName[0].toUpperCase()}
        </span>
      );
    }
    if (userData.email) {
      return (
        <span className={css.avatarPlaceholder}>
          {userData.email[0].toUpperCase()}
        </span>
      );
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById("fileInput");

    if (fileInput) {
      fileInput.click();
    } else {
      console.error("");
    }
  };

  return (
    <BaseModal onClose={onClose} isShow={isShow} title="Setting">
      <div className={css.modal} onClick={(e) => e.stopPropagation()}>
        <div className={css.modalContent}>
          <Formik
            initialValues={{
              gender: userData.gender || "woman",
              userName: userData.userName || "",
              email: userData.email || "",
              currentPassword: "",
              newPassword: "",
              confirmNewPassword: "",
            }}
            validationSchema={userSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue }) => (
              <Form>
                <label className={css.label}>Your photo</label>
                <div className={css.photoUploadBox}>
                  <div className={css.photoUploadContainer}>
                    {preview ? (
                      <div className={css.avatarPreviewWrapper}>
                        <img
                          src={preview}
                          alt="Avatar Preview"
                          className={css.avatar}
                        />
                      </div>
                    ) : (
                      getAvatarContent()
                    )}
                  </div>

                  <button
                    type="button"
                    className={css.uploadButton}
                    onClick={handleButtonClick}
                  >
                    <input
                      type="file"
                      name="avatar"
                      id="fileInput"
                      accept="image/png, image/jpeg"
                      hidden
                      onChange={(e) => handleAvatarChange(e, setFieldValue)}
                    />
                    <ErrorMessage
                      name="avatar"
                      component="p"
                      className={css.error}
                    />
                    <Icon
                      id="arrow-up"
                      width={16}
                      height={16}
                      className="icon-blue"
                    />
                    Upload a photo
                  </button>
                </div>

                <div className={css.inputGroup}>
                  <div className={css.input1}>
                    <div className={css.formGroup}>
                      <label className={css.label}>Your gender identity</label>
                      <div className={css.gender}>
                        <label>
                          <Field type="radio" name="gender" value="Woman" />{" "}
                          Woman
                        </label>
                        <label>
                          <Field type="radio" name="gender" value="Man" /> Man
                        </label>
                        <ErrorMessage
                          name="gender"
                          component="p"
                          className={css.error}
                        />
                      </div>
                    </div>

                    <div className={css.formGroup}>
                      <label className={css.label}>Your name</label>
                      <Field
                        className={css.input}
                        type="text"
                        name="userName"
                        placeholder="Enter your name"
                      />
                      <ErrorMessage
                        name="userName"
                        component="p"
                        className={css.error}
                      />
                    </div>

                    <div className={css.formGroup}>
                      <label className={css.label}>E-mail</label>
                      <Field
                        className={css.input}
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                      />
                      <ErrorMessage
                        name="email"
                        component="p"
                        className={css.error}
                      />
                    </div>
                  </div>

                  <div className={css.input2}>
                    <div className={css.formGroup}>
                      <label className={css.label}>Password</label>
                      <p>Outdated password:</p>
                      <div className={css.inputWrap}>
                        <Field
                          className={css.input}
                          type={ShowCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          placeholder="Password"
                        />
                        <button
                          className={css.buttonSvg}
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!ShowCurrentPassword)
                          }
                        >
                          <Icon
                            id={ShowCurrentPassword ? "eye" : "eye-slash"}
                            className="icon-blue"
                            width={16}
                            height={16}
                          />
                        </button>
                      </div>
                      <ErrorMessage
                        name="currentPassword"
                        component="p"
                        className={css.error}
                      />
                    </div>

                    <div className={css.formGroup}>
                      <label>New Password:</label>
                      <div className={css.inputWrap}>
                        <Field
                          className={css.input}
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          placeholder="Password"
                        />
                        <button
                          className={css.buttonSvg}
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <Icon
                            id={showNewPassword ? "eye" : "eye-slash"}
                            className="icon-blue"
                            width={16}
                            height={16}
                          />
                        </button>
                      </div>
                      <ErrorMessage
                        name="newPassword"
                        component="p"
                        className={css.error}
                      />
                    </div>

                    <div className={css.formGroup}>
                      <label>Repeat new password:</label>
                      <div className={css.inputWrap}>
                        <Field
                          className={css.input}
                          type={showConfirmNewPassword ? "text" : "password"}
                          name="confirmNewPassword"
                          placeholder="Password"
                        />
                        <button
                          className={css.buttonSvg}
                          type="button"
                          onClick={() =>
                            setShowConfirmNewPassword(!showConfirmNewPassword)
                          }
                        >
                          <Icon
                            id={showConfirmNewPassword ? "eye" : "eye-slash"}
                            className="icon-blue"
                            width={16}
                            height={16}
                          />
                        </button>
                      </div>
                      <ErrorMessage
                        name="confirmNewPassword"
                        component="p"
                        className={css.error}
                      />
                    </div>
                  </div>
                </div>

                <div className={css.contBtn}>
                  <button className={css.saveBtn} type="submit">
                    Save
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </BaseModal>
  );
};

export default SettingModal;
