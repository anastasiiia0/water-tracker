import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import css from "./AuthForm.module.css";
import { logIn, register } from "../../redux/auth/operations";
import { useEffect } from "react";
import Icon from "../Icon/Icon";
import { selectIsLoggedIn } from "../../redux/auth/selectors";
import { showNotification } from "../../redux/notification/slice";
import GoogleLoginButton from "../GoogleBtn/GoogleLoginButton";
const AuthForm = ({ isSignup }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevState) => !prevState);
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Required"),
    ...(isSignup && {
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (isSignup) {
      dispatch(register({ email: values.email, password: values.password }))
        .unwrap()
        .then(() => {})
        .catch((err) => {
          if (err.response.status === 409) {
            dispatch(
              showNotification(
                "Email already in use. Please try to log in or use a different email."
              )
            );
            return;
          } else {
            const errorMessage = err.response.data.message;
            dispatch(showNotification(`Registration error: ${errorMessage}`));
          }
        });
    } else {
      dispatch(logIn({ email: values.email, password: values.password }))
        .unwrap()
        .then(() => {})
        .catch((err) => {
          console.log(err.status); //in case of 401 error returns Undefined
          if (err.status === 404) {
            dispatch(
              showNotification(
                "User not found. Please try to register first or use a different email."
              )
            );
            return;
          } else {
            dispatch(
              showNotification("Login error, incorrect email or password")
            );
          }
        });
    }
    setSubmitting(false);
  };

  return (
    <div className={css.authFormContainer}>
      <h1 className={css.authPageTitle}>{isSignup ? "Sign Up" : "Sign In"}</h1>
      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className={css.formGroup}>
              <label htmlFor="email">Enter your email</label>
              <Field
                className={`${css.input} ${
                  errors.email && touched.email ? css.inputError : ""
                }`}
                type="email"
                name="email"
                id="email"
                placeholder="E-mail"
              />
              <ErrorMessage
                name="email"
                component="div"
                className={css.error}
              />
            </div>
            <div className={css.formGroup}>
              <label htmlFor="password">Enter your password</label>
              <div className={css.passwordWrapper}>
                <Field
                  className={`${css.input} ${
                    errors.password && touched.password ? css.inputError : ""
                  }`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Password"
                />
                <span
                  className={css.passwordToggleIcon}
                  onClick={togglePasswordVisibility}
                >
                  <Icon
                    id={showPassword ? "eye" : "eye-slash"}
                    width={24}
                    height={24}
                    className={css.icon}
                  />
                </span>
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className={css.error}
              />
            </div>
            {isSignup && (
              <div className={css.formGroup}>
                <label htmlFor="confirmPassword">Repeat Password</label>
                <div className={css.passwordWrapper}>
                  <Field
                    className={`${css.input} ${
                      errors.confirmPassword && touched.confirmPassword
                        ? css.inputError
                        : ""
                    }`}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Repeat Password"
                  />
                  <span
                    className={css.passwordToggleIcon}
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    <Icon
                      id={showConfirmPassword ? "eye" : "eye-slash"}
                      width={24}
                      height={24}
                      className="icon-blue"
                    />
                  </span>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className={css.error}
                />
              </div>
            )}
            <button type="submit" aria-label="Submit" disabled={isSubmitting}>
              {isSignup ? "Sign Up" : "Sign In"}
            </button>
          </Form>
        )}
      </Formik>
      <GoogleLoginButton />
      <div className={css.navigation}>
        {isSignup ? (
          <p>
            <a href="/signin">Sign in</a>
          </p>
        ) : (
          <>
            <p>
              <a href="/forgot-password">Forgot password?</a>
            </p>
            <p>
              <a href="/signup">Sign up</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
