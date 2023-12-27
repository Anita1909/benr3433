const express = require('express');
const app = express();
const port = 1923;
const jwt = require('jsonwebtoken');
const {MongoClient, ObjectId} = require('mongodb');

app.use(express.json());

// MongoDB connection URI
const uri = 'mongodb+srv://anitagobinathan19:anita1909@cluster0.aztb9bv.mongodb.net/VisitorManagementSystem';

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');

    // Get the admin and visitors collections
    const db = client.db('VisitorManagementSystem');
    const adminCollection = db.collection('admin');
    const visitorsCollection = db.collection('visitor');
    const vehiclesCollection = db.collection('vehicle');
    const hostelCollection = db.collection('hostel');
    const blockCollection = db.collection('block');
    const securityCollection = db.collection('security');
  

    // Helper functions
    function login(reqUsername, reqPassword) {
      return adminCollection.findOne({ username: reqUsername, password: reqPassword })
        .then(matchAdmin => {
          if (!matchAdmin) {
            return {
              success: false,
              message: "Admin not found!"
            };
          } else {
            return {
              success: true,
              admin: matchAdmin
            };
          }
        })
        .catch(error => {
          console.error('Error in login:', error);
          return {
            success: false,
            message: "An error occurred during login."
          };
        });
    }

    function register(reqUsername, reqPassword, reqName, reqEmail) {
      return adminCollection.insertOne({
        username: reqUsername,
        password: reqPassword,
        name: reqName,
        email: reqEmail
      })
        .then(() => {
          return "Registration successful!";
        })
        .catch(error => {
          console.error('Error in register:', error);
          return "An error occurred during registration.";
        });
    }

    function generateToken(adminData) {
      const token = jwt.sign(
        adminData,
        'inipassword',
        { expiresIn: '1h' }
      );
      return token;
    }

    function verifyToken(req, res, next) {
      let header = req.headers.authorization;
      console.log(header);

      let token = header.split(' ')[1];

      jwt.verify(token, 'inipassword', function (err, decoded) {
        if (err) {
          res.send("Invalid Token");
        }
        req.admin = decoded;
        next();
      });
    }

    // Login route
    app.post('/login', (req, res) => {
      console.log(req.body);

      let result = login(req.body.username, req.body.password);
      result.then(response => {
        if (response.success) {
          let token = generateToken(response.admin);
          res.send(token);
        } else {
          res.status(401).send(response.message);
        }
      }).catch(error => {
        console.error('Error in login route:', error);
        res.status(500).send("An error occurred during login.");
      });
    });

    // Register route
    app.post('/register', (req, res) => {
      console.log(req.body);

      let result = register(req.body.username, req.body.password, req.body.name, req.body.email);
      result.then(response => {
        res.send(response);
      }).catch(error => {
        console.error('Error in register route:', error);
        res.status(500).send("An error occurred during registration.");
      });
    });

// Create visitorsRegistration route
  app.post('/visitorsRegistration', verifyToken, (req, res) => {
    const visitorData = req.body;

    const visitor = visitorData.visitor;
    const vehicle = visitorData.vehicle;
    const hostel = visitorData.hostel;
    const block = visitorData.block;
    const security = visitorData.security;
      
      Promise.all([
        visitorsCollection.insertOne(visitor),
        vehiclesCollection.insertOne(vehicle),
        hostelCollection.insertOne(hostel),
        blockCollection.insertOne(block),
        securityCollection.insertOne(security)
        
      ])
        .then(() => {
          const visitorsData = {
            visitorId: visitor._id,
            vehicleId: vehicle._id,
            hostelId: hostel._id,
            blockId: block._id,
            securityId: security._id,
          };

          return visitorsRegistrationCollection.insertOne(visitorsData);
        })
        .then(() => {
          res.send('Visitor registration created successfully');
        })
        .catch(error => {
          console.error('Error creating visitor registration:', error);
          res.status(500).send('An error occurred while creating the visitor registration');
        });
    });

    // Create visitor route
    app.post('/visitor', verifyToken, (req, res) => {
      const visitor = req.body;
      visitorsCollection.insertOne(visitor)
        .then(() => {
          res.send('Visitor into created successfully');
        })
        .catch(error => {
          console.error('Error creating visitor:', error);
          res.status(500).send('An error occurred while creating the visitor info');
        });
    });
    
    // Create vehicle route
    app.post('/vehicle', verifyToken, (req, res) => {
      const vehicle = req.body;
      vehiclesCollection.insertOne(vehicle)
        .then(() => {
          res.send('vehicle created successfully');
        })
        .catch(error => {
          console.error('Error creating vehicle:', error);
          res.status(500).send('An error occurred while creating the vehicle');
        });
    });

    // Create hostel route
    app.post('/hostel', verifyToken, (req, res) => {
      const hostel = req.body;
      hostelCollection.insertOne(hostel)
        .then(() => {
          res.send('hostel created successfully');
        })
        .catch(error => {
          console.error('Error creating hostel:', error);
          res.status(500).send('An error occurred while creating hostel');
        });
    });

    // Create block route
    app.post('/block', verifyToken, (req, res) => {
      const block = req.body;
      blockCollection.insertOne(block)
        .then(() => {
          res.send('block created successfully');
        })
        .catch(error => {
          console.error('Error creating block:', error);
          res.status(500).send('An error occurred while creating block');
        });
    });

    // Create security route
    app.post('/security', verifyToken, (req, res) => {
      const security = req.body;
      securityCollection.insertOne(security)
        .then(() => {
          res.send('Security created successfully');
        })
        .catch(error => {
          console.error('Error creating security:', error);
          res.status(500).send('An error occurred while creating security');
        });
    });


    // Read the visitorsRegistration route
    app.get('/visitorsRegistration', verifyToken, (req, res) => {
      visitorsRegistrationCollection.find().toArray()
        .then(visitors => {
          res.json(visitors);
        })
        .catch(error => {
          console.error('Error retrieving visitor registrations:', error);
          res.status(500).send('An error occurred while retrieving visitor registrations');
        });
    });

    // Read the visitor route
    app.get('/visitor', verifyToken, (req, res) => {
      visitorsCollection.find().toArray()
        .then(visitors => {
          res.json(visitors);
        })
        .catch(error => {
          console.error('Error retrieving visitor information:', error);
          res.status(500).send('An error occurred while retrieving visitor information');
        });
    });

    // Read the vehicle route
    app.get('/vehicle', verifyToken, (req, res) => {
      vehiclesCollection.find().toArray()
        .then(visitors => {
          res.json(visitors);
        })
        .catch(error => {
          console.error('Error retrieving vehicle:', error);
          res.status(500).send('An error occurred while retrieving vehicle');
        });
    });

    // Read the hostel route
    app.get('/hostel', verifyToken, (req, res) => {
      hostelCollection.find().toArray()
        .then(visitors => {
          res.json(visitors);
        })
        .catch(error => {
          console.error('Error retrieving hostel:', error);
          res.status(500).send('An error occurred while retrieving hostel');
        });
    });

    // Read the block route
    app.get('/block', verifyToken, (req, res) => {
      blockCollection.find().toArray()
        .then(visitors => {
          res.json(visitors);
        })
        .catch(error => {
          console.error('Error retrieving block:', error);
          res.status(500).send('An error occurred while retrieving block');
        });
    });

    // Read the security route
    app.get('/security', verifyToken, (req, res) => {
      securityCollection.find().toArray()
        .then(visitors => {
          res.json(visitors);
        })
        .catch(error => {
          console.error('Error retrieving security:', error);
          res.status(500).send('An error occurred while retrieving security');
        });
    });


    const { ObjectId } = require('mongodb');

    // Update visitorsRegistration collection
    app.patch('/visitorsRegistration/:id', verifyToken, (req, res) => {
      const visitorRegistrationId = req.params.id;
      const updatedVisitorRegistration = req.body;

      // Verify that updatedVisitorRegistration is not null or undefined
      if (!updatedVisitorRegistration) {
        return res.status(400).send('Invalid request');
      }

      // Remove any null or undefined fields from updatedVisitorRegistration
      const cleanedVisitorRegistration = {};
      Object.keys(updatedVisitorRegistration).forEach(key => {
        if (updatedVisitorRegistration[key] !== null && updatedVisitorRegistration[key] !== undefined) {
          cleanedVisitorRegistration[key] = updatedVisitorRegistration[key];
        }
      });

      // Update visitorsRegistration collection
      visitorsRegistrationCollection.updateOne(
        { _id: new ObjectId(visitorRegistrationId) },
        { $set: cleanedVisitorRegistration }
      )
        .then(result => {
          if (result.modifiedCount === 0) {
            return res.status(404).send('Visitor registration not found');
          }

          // Update related collections
          const promises = [];

          if (cleanedVisitorRegistration.visitorId) {
            promises.push(
              visitorsCollection.updateOne(
                { _id: new ObjectId(cleanedVisitorRegistration.visitorId) },
                { $set: cleanedVisitorRegistration.visitor }
              )
            );
          }

          if (cleanedVisitorRegistration.vehicleId) {
            promises.push(
              vehiclesCollection.updateOne(
                { _id: new ObjectId(cleanedVisitorRegistration.vehicleId) },
                { $set: cleanedVisitorRegistration.vehicle }
              )
            );
          }

          if (cleanedVisitorRegistration.hostelId) {
            promises.push(
              hostelCollection.updateOne(
                { _id: new ObjectId(cleanedVisitorRegistration.hostelId) },
                { $set: cleanedVisitorRegistration.hostel }
              )
            );
          }

          if (cleanedVisitorRegistration.blockId) {
            promises.push(
              blockCollection.updateOne(
                { _id: new ObjectId(cleanedVisitorRegistration.blockId) },
                { $set: cleanedVisitorRegistration.block }
              )
            );
          }

          if (cleanedVisitorRegistration.aecurityId) {
            promises.push(
              securityCollection.updateOne(
                { _id: new ObjectId(cleanedVisitorRegistration.securityId) },
                { $set: cleanedVisitorRegistration.security }
              )
            );
          }

          // Wait for all update operations to complete
          Promise.all(promises)
            .then(() => {
              res.send('Visitor registration and related documents updated successfully');
            })
            .catch(error => {
              console.error('Error updating related collections:', error);
              res.status(500).send('An error occurred while updating related collections');
            });
        })
        .catch(error => {
          console.error('Error updating visitorsRegistration collection:', error);
          res.status(500).send('An error occurred while updating the visitorsRegistration collection');
        });
    });

    // Delete visitorsRegistration route
    app.delete('/visitorsRegistration/:id', verifyToken, (req, res) => {
      const visitorRegistrationId = req.params.id;

      // Find the visitor registration document
      visitorsRegistrationCollection.findOne({ _id: new ObjectId(visitorRegistrationId) })
        .then(visitorRegistration => {
          if (!visitorRegistration) {
            return res.status(404).send('Visitor registration not found');
          }

          // Delete the visitor registration document
          visitorsRegistrationCollection.deleteOne({ _id: new ObjectId(visitorRegistrationId) })
            .then(deleteResult => {
              if (deleteResult.deletedCount === 0) {
                return res.status(404).send('Visitor registration not found');
              }

              // Delete related documents from other collections
              const promises = [];

              promises.push(
                visitorsCollection.deleteOne({ _id: new ObjectId(visitorRegistration.visitorId) }),
                vehiclesCollection.deleteOne({ _id: new ObjectId(visitorRegistration.vehicleId) }),
                hostelCollection.deleteOne({ _id: new ObjectId(visitorRegistration.hostelId) }),
                blockCollection.deleteOne({ _id: new ObjectId(visitorRegistration.blockId) }),
                securityCollection.deleteOne({ _id: new ObjectId(visitorRegistration.securityId) }),
              );

              // Wait for all delete operations to complete
              Promise.all(promises)
                .then(() => {
                  res.send('Visitor registration and related documents deleted successfully');
                })
                .catch(error => {
                  console.error('Error deleting related documents:', error);
                  res.status(500).send('An error occurred while deleting related documents');
                });
            })
            .catch(error => {
              console.error('Error deleting visitor registration:', error);
              res.status(500).send('An error occurred while deleting the visitor registration');
            });
        })
        .catch(error => {
          console.error('Error finding visitor registration:', error);
          res.status(500).send('An error occurred while finding the visitor registration');
        });
    });


    // Start the server
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });