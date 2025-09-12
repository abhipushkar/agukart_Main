import {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import {DialogActions, DialogContent, DialogTitle, InputAdornment, Typography} from "@mui/material";
import TextField from "@mui/material/TextField";
import {Public, Search} from "@mui/icons-material";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";

export const CountryModal = ({ open, onClose, countries, currentCountry, onCountrySelect }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCountries, setFilteredCountries] = useState(countries);

    useEffect(() => {
        setFilteredCountries(countries);
    }, [countries]);

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(country =>
                country.name.toLowerCase().includes(query) ||
                (country.sortname && country.sortname.toLowerCase().includes(query))
            );
            setFilteredCountries(filtered);
        }
    };

    const handleCountrySelect = (country) => {
        onCountrySelect(country);
        onClose();
    };

    return (
        <Dialog open={open} onClose={() => {
            setSearchQuery("");
            setFilteredCountries(countries);
            onClose();
        }} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" fontWeight={600}>
                    Select Delivery Country
                </Typography>
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={handleSearch}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2, mt: 1 }}
                />

                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {filteredCountries.map((country) => (
                        <MenuItem
                            key={country._id || country.sortname}
                            onClick={() => handleCountrySelect(country)}
                            selected={currentCountry === country.name}
                            sx={{
                                "&.Mui-selected": {
                                    backgroundColor: "primary.light",
                                    "&:hover": {
                                        backgroundColor: "primary.light"
                                    }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Public sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={country.name}
                                primaryTypographyProps={{ variant: "body2" }}
                            />
                        </MenuItem>
                    ))}
                </Box>
            </DialogContent>
            {/*<DialogActions>*/}
            {/*    <Button onClick={onClose}>Cancel</Button>*/}
            {/*</DialogActions>*/}
        </Dialog>
    );
};
