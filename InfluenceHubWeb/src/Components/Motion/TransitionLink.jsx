import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { navigateWithOverdrive, shouldHandleTransitionClick } from "../../utils/overdrive";

export const TransitionLink = ({
  children,
  onClick,
  replace,
  state,
  target,
  to,
  ...props
}) => {
  const navigate = useNavigate();

  const handleClick = (event) => {
    onClick?.(event);

    if (!shouldHandleTransitionClick(event, target)) {
      return;
    }

    event.preventDefault();
    navigateWithOverdrive(navigate, to, { replace, state });
  };

  return (
    <Link
      {...props}
      replace={replace}
      state={state}
      target={target}
      to={to}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export const TransitionNavLink = ({
  children,
  onClick,
  replace,
  state,
  target,
  to,
  ...props
}) => {
  const navigate = useNavigate();

  const handleClick = (event) => {
    onClick?.(event);

    if (!shouldHandleTransitionClick(event, target)) {
      return;
    }

    event.preventDefault();
    navigateWithOverdrive(navigate, to, { replace, state });
  };

  return (
    <NavLink
      {...props}
      replace={replace}
      state={state}
      target={target}
      to={to}
      onClick={handleClick}
    >
      {children}
    </NavLink>
  );
};
