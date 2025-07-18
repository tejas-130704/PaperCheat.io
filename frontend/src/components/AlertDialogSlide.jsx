import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide({ isOpenDialog, setIsOpenDialog, gameRestart, dialogMessage }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(isOpenDialog);
  }, [isOpenDialog]);

  const handleGameLeave = () => {
    setOpen(false);
    setIsOpenDialog(false);
    window.location.href = "/";
  };

  return (
    <div>
      {open && (
        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          aria-describedby="alert-dialog-slide-description"
          PaperProps={{
            className: "rounded-2xl bg-white shadow-xl border border-gray-300 py-6",
            sx: { minWidth: '360px', paddingX: 3 },
          }}
        >
          <DialogTitle className="text-xl font-bold text-red-600 border-b pb-2">
            🚨 Player Disconnected
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              id="alert-dialog-slide-description"
              className="text-gray-800 text-base pt-2"
            >
              {dialogMessage}
              <br />
              <span className="text-black font-semibold mt-2 inline-block">
                Do you want to Restart or Leave the game?
              </span>
            </DialogContentText>
          </DialogContent>
          <DialogActions className="px-4 pb-4">
            <Button
              onClick={gameRestart}
              className="!text-white !bg-green-600 hover:!bg-green-700 !rounded-md !px-4 !py-1"
            >
              🔄 Restart
            </Button>
            <Button
              onClick={handleGameLeave}
              className="!text-white !bg-red-600 hover:!bg-red-700 !rounded-md !px-4 !py-1"
            >
              🚪 Leave
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
