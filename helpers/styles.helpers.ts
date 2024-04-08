import { createStyles, makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(() =>
  createStyles({
    datePicker: {
      "& .MuiInputBase-root": {
        height: "45px",
      },
      "& .MuiSvgIcon-root": {
        width: "1em",
        height: "1em",
      },
      "& .MuiFormLabel-root": {
        transform: "translate(14px, 14px) scale(1)",
      },
      "& .MuiInputLabel-shrink": {
        transform: "translate(14px, -6px) scale(0.75)",
      },
    },
  })
);
