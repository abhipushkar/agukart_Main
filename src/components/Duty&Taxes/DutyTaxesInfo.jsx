import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { Box, Typography } from '@mui/material'

const DutyTaxesInfo = ({ open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} >
            <DialogTitle>
                Custom Duties & Taxes
            </DialogTitle>
            <DialogContent>
                <DialogContentText component="div">
                    <Typography paragraph>
                        When a package is delivered internationally, it may be subject to import
                        taxes, customs duties, VAT/GST, and/or other fees imposed by the
                        destination country. These charges are typically due once the package
                        arrives in the destination country.
                    </Typography>

                    <Typography fontWeight={600} gutterBottom>
                        Please note:
                    </Typography>

                    <Box component="ul" sx={{
                        pl: 3,
                        m: 0,
                        listStyleType: "disc",
                    }}>
                        <li>
                            <Typography>
                                These charges are not included in your order total unless explicitly stated.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                Any applicable import duties, taxes, VAT/GST, or customs clearance  fees are the buyer's responsibility.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                The amount varies by country and cannot be predicted in advance.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                Payment may be required before or at the time of delivery.
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                If a shipment is refused due to unpaid customs duties or taxes, the seller is not responsible for any refund, shipping costs, customs charges, or return fees etc.
                            </Typography>
                        </li>
                    </Box>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    color="primary"
                >
                    close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DutyTaxesInfo