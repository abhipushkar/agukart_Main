  import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

const StyledTooltip = styled(Tooltip)(({ theme, maxWidth }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0,0,0,0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
    maxWidth: maxWidth || 300,
  },
}));

const LightTooltip = ({
  title,
  children,
  placement = "top",
  arrow = true,
  enterDelay = 200,
  leaveDelay = 100,
  maxWidth = 300,
  disableHoverListener = false,
  disableFocusListener = false,
  disableTouchListener = false,
  ...props
}) => {
  return (
    <StyledTooltip
      title={title}
      placement={placement}
      arrow={arrow}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      disableHoverListener={disableHoverListener}
      disableFocusListener={disableFocusListener}
      disableTouchListener={disableTouchListener}
      maxWidth={maxWidth}
      {...props}
    >
      {children}
    </StyledTooltip>
  );
};

export default LightTooltip;