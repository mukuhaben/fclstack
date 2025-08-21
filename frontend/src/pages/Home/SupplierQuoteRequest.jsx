import React, { useState } from 'react';
import { 
  Box, 
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  Paper
} from '@mui/material';
import backgroundImage from '../../assets/images/Group982.png'; // Adjust the path as necessary

const SupplierQuoteRequest = () => {
  const [formData, setFormData] = useState({
    item: '',
    details: '',
    quantity: '',
    unit: 'Pcs'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '320px',
        overflow: 'hidden',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(25, 118, 210, 0.9) 0%, rgba(25, 118, 210, 0.7) 100%)',
          zIndex: 1
        }
      }}
    >
      <Container maxWidth="lg" sx={{ height: '100%', py: 4 }}>
        <Grid container spacing={4} sx={{ height: '100%', position: 'relative', zIndex: 2 }}>
          {/* Left Side - Text Content */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h4" component="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              An easy way to send requests to all suppliers
            </Typography>
            <Typography variant="body1" sx={{ color: 'white', opacity: 0.8 }}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt.
            </Typography>
          </Grid>
          
          {/* Right Side - Form */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <Paper 
              elevation={3}
              sx={{ 
                width: '100%', 
                p: 3,
                borderRadius: 2,
                backgroundColor: 'white'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium', textAlign: 'center' }}>
                Send quote to suppliers
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="What item you need?"
                  variant="outlined"
                  size="medium"
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Type more details"
                  variant="outlined"
                  multiline
                  rows={3}
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="Quantity"
                    variant="outlined"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    sx={{ flex: 1 }}
                  />
                  
                  <FormControl sx={{ minWidth: 120 }}>
                    <Select
                      value={formData.unit}
                      name="unit"
                      onChange={handleChange}
                      variant="outlined"
                    >
                      <MenuItem value="Pcs">Pcs</MenuItem>
                      <MenuItem value="Kg">Kg</MenuItem>
                      <MenuItem value="Set">Set</MenuItem>
                      <MenuItem value="Box">Box</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: '1rem'
                  }}
                >
                  Send inquiry
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SupplierQuoteRequest;
