import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Logout from './Logout'; 

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Logout Component', () => {
  it('navigates to login page on clicking "Yes" button', () => {
    render(
      <Router>
        <Logout />
      </Router>
    );

    // Click the "Yes" button
    fireEvent.click(screen.getByText('Yes'));

    // Check if navigate was called with "/"
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to homepage on clicking "No" button', () => {
    render(
      <Router>
        <Logout />
      </Router>
    );

    // Click the "No" button
    fireEvent.click(screen.getByText('No'));

   // Check if navigate was called with "/Homepage"
   expect(mockNavigate).toHaveBeenCalledWith("/Homepage");
  }); 
});


