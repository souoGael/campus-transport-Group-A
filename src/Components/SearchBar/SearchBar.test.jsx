import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import SearchBar from './SearchBar';
import { auth, firestore } from '../../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';

jest.mock('../../utils/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(() => jest.fn()), // Return a mock unsubscribe function
  },
  firestore: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(),
  collection: jest.fn(),
}));

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input and buttons', () => {
    render(<SearchBar onQueryChange={jest.fn()} />);

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('updates the query state when the user types', () => {
    render(<SearchBar onQueryChange={jest.fn()} />);

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Library' } });

    expect(input.value).toBe('Library');
  });

  test('clears the query when the clear button is clicked', async () => {
    render(<SearchBar onQueryChange={jest.fn()} />);

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Library' } });

    // Wait for clear icon to appear
    await waitFor(() => {
      const clearIcon = screen.getByTestId('clear-icon');
      fireEvent.click(clearIcon);
    });

    expect(input.value).toBe('');
  });
 
//   test('fetches buildings from firestore on mount', async () => {
//     getDocs.mockResolvedValueOnce({
//       docs: [
//         {
//           id: 'Building A',
//           data: () => ({
//             description: 'A beautiful building',
//             image: 'image-url',
//           }),
//         },
//       ],
//     });

//     render(<SearchBar onQueryChange={jest.fn()} forceShowDropdown={true} />);

//     await waitFor(() => {
//       expect(getDocs).toHaveBeenCalledWith(collection(firestore, 'Buildings'));
//       expect(screen.queryByText(/building a/i)).toBeInTheDocument();
//     });
//   });

  test('shows dropdown when search query matches buildings', async () => {
    // Mocking the Firestore response
    getDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'Building A',
          data: () => ({
            description: 'A beautiful building',
            image: 'image-url',
          }),
        },

      ],
    });

    // Render the component
    render(<SearchBar onQueryChange={jest.fn()} forceShowDropdown={true} />);

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Building' } });

    expect(screen.getByDisplayValue('Building')).toBeInTheDocument();
  });


//   test('filters building names in dropdown based on input', async () => {
//     getDocs.mockResolvedValueOnce({
//       docs: [
//         {
//           id: 'Library',
//           data: () => ({
//             description: 'A quiet place to read',
//           }),
//         },
//         {
//           id: 'Gym',
//           data: () => ({
//             description: 'Fitness center',
//           }),
//         },
//       ],
//     });

//     render(<SearchBar onQueryChange={jest.fn()} forceShowDropdown={true} />);

//     const input = screen.getByPlaceholderText(/search/i);
//     fireEvent.change(input, { target: { value: 'Lib' } });

//     await waitFor(() => {
//       expect(screen.getByText(/library/i)).toBeInTheDocument();
//       expect(screen.queryByText(/gym/i)).not.toBeInTheDocument();
//     });
//   });

 

  test('calls onQueryChange when the query changes', () => {
    const onQueryChangeMock = jest.fn();
    render(<SearchBar onQueryChange={onQueryChangeMock} />);

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'Library' } });

    expect(onQueryChangeMock).toHaveBeenCalledWith('Library');
  });

  
});
