const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const options = {
    definition: {
        swagger: "2.0",
        info: {
            title: "Hair Salon Booking API",
            description: "API for Hair Salon Booking Application",
            version: "1.0.0",
            contact: {
                name: "Developer",
                email: "developer@hairsalon.com"
            }
        },
        host: "localhost:3000",
        basePath: "/api/v1",
        schemes: ["http"],
        securityDefinitions: {
            bearerAuth: {
                type: "apiKey",
                in: "header",
                name: "Authorization",
                description: "JWT Authorization header using Bearer scheme. Example: 'Bearer {token}'"
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        definitions: {
            User: {
                type: "object",
                properties: {
                    userID: { type: "string", example: "user-123" },
                    phoneNumber: { type: "string", example: "0123456789" },
                    email: { type: "string", example: "user@example.com" },
                    fullName: { type: "string", example: "John Doe" },
                    role: { type: "string", enum: ["Customer", "Staff", "Stylist", "Manager"] }
                }
            },
            LoginRequest: {
                type: "object",
                required: ["phoneNumber", "password"],
                properties: {
                    phoneNumber: { type: "string", example: "0123456789" },
                    password: { type: "string", example: "password123" }
                }
            },
            RegisterRequest: {
                type: "object",
                required: ["phoneNumber", "email", "password", "fullName"],
                properties: {
                    phoneNumber: { type: "string", example: "0123456789" },
                    email: { type: "string", example: "user@example.com" },
                    password: { type: "string", example: "password123" },
                    fullName: { type: "string", example: "John Doe" },
                    role: { type: "string", enum: ["Customer", "Staff", "Stylist", "Manager"], example: "Customer" }
                }
            },
            Booking: {
                type: "object",
                properties: {
                    bookingID: { type: "string", example: "booking-123" },
                    customerID: { type: "string", example: "customer-123" },
                    stylistID: { type: "string", example: "stylist-123" },
                    serviceIDs: { type: "array", items: { type: "string" }, example: ["service-1", "service-2"] },
                    bookingDate: { type: "string", format: "date-time", example: "2024-01-15T10:00:00Z" },
                    status: { type: "string", enum: ["Pending", "Confirmed", "Completed", "Cancelled"], example: "Pending" },
                    totalPrice: { type: "number", example: 150000 }
                }
            },
            Service: {
                type: "object",
                properties: {
                    serviceID: { type: "string", example: "service-123" },
                    serviceName: { type: "string", example: "Haircut" },
                    description: { type: "string", example: "Basic haircut service" },
                    price: { type: "number", example: 50000 },
                    duration: { type: "number", example: 30 },
                    imageURL: { type: "string", example: "https://example.com/image.jpg" }
                }
            },
            Error: {
                type: "object",
                properties: {
                    status: { type: "number", example: 400 },
                    message: { type: "string", example: "Error message" }
                }
            }
        }
    },
    apis: ['./api/v1/routes/*.js', './api/v1/controllers/*.js'],
    basePath: '/api/v1'
};

const swaggerSpec = swaggerJsdoc(options);

fs.writeFileSync('./swagger-output.json', JSON.stringify(swaggerSpec, null, 2));
console.log('Swagger file generated successfully!');
console.log('Total paths:', Object.keys(swaggerSpec.paths).length);