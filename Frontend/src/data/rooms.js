import deluxeImg from '../assets/images/deluxe.jpg';
import singleImg from '../assets/images/single.jpg';
import familyImg from '../assets/images/family.jpg';
import kingImg from '../assets/images/kingsize.jpg'; // Filename was 'kingsize.jpg' in list, 'king.jpg' in Rooms.jsx. I verified 'kingsize.jpg' exists.
import doubleImg from '../assets/images/double.jpg';
import vipImg from '../assets/images/vip.jpg';

export const roomsData = [
    {
        id: 1,
        name: "Deluxe Room",
        price: 150,
        short_description: "Spacious room with king size bed and city view.",
        image: deluxeImg
    },
    {
        id: 2,
        name: "Single Room",
        price: 100,
        short_description: "Cozy and quiet, perfect for solo travelers.",
        image: singleImg
    },
    {
        id: 3,
        name: "Family Room",
        price: 300,
        short_description: "Spacious accommodation suitable for families with kids.",
        image: familyImg
    },
    {
        id: 4,
        name: "King Size Suite",
        price: 250,
        short_description: "Luxurious suite with premium amenities.",
        image: kingImg
    },
    {
        id: 5,
        name: "Double Bed Room",
        price: 400,
        short_description: "Perfect for couples, offering enhanced comfort.",
        image: doubleImg
    },
    {
        id: 6,
        name: "VIP Suite",
        price: 500,
        short_description: "Exclusive experience for our most distinguished guests.",
        image: vipImg
    }
];
