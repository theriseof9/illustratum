var allPresets = {
    "FigureEight": {
        dimensionless: true,
        masses: [1, 1, 1],
        massSlider: {
            min: 0.1,
            max: 5,
            power: 3
        },
        timeScaleFactor: 1,
        timeScaleFactorSlider: {
            min: 0.00,
            max: 5000,
            power: 5
        },
        positions: [ // in Polar coordinates, r is in meters
            polarFromCartesian(figure8Position),
            polarFromCartesian({x: -figure8Position.x, y: -figure8Position.y}),
            polarFromCartesian({x: 0, y: 0})
        ],
        velocities: [ // in Polar coordinates, r is in m/s
            polarFromCartesian({x: -figure8Velocity.x / 2, y: -figure8Velocity.y/2}),
            polarFromCartesian({x: -figure8Velocity.x / 2, y: -figure8Velocity.y/2}),
            polarFromCartesian(figure8Velocity)
        ]
    },
    "SunEarthJupiter": {
        masses: [1.98855 * Math.pow(10, 30), 5.972 * Math.pow(10, 24), 1.898 * Math.pow(10, 27)],
        densities: [0.01, 0.01, 0.01],
        massSlider: {
            min: 3 * Math.pow(10, 10),
            max: 3 * Math.pow(10, 31),
            power: 3
        },
        timeScaleFactor: 3600 * 24 * 365,
        timeScaleFactorSlider: {
            min: 0,
            max: 3600 * 24 * 500 * 10000,
            power: 5
        },
        positions: [ // in Polar coordinates, r is in meters
            {
                r: 0,
                theta: 0
            },
            {
                r: 1.496 * Math.pow(10, 11),
                theta: 0
            },
            {
                r: 7.78 * Math.pow(10, 11),
                theta: 0
            }
        ],
        velocities: [ // in Polar coordinates, r is in m/s
            {
                r: 0,
                theta: Math.PI/2
            },
            {
                r: 30 * Math.pow(10, 3),
                theta: Math.PI/2
            },
            {
                r: 13.1 * Math.pow(10, 3),
                theta: Math.PI/2
            }
        ]
    },
    "LagrangePoint5": {
        masses: [1.98855 * Math.pow(10, 30), 5.972 * Math.pow(10, 24), 1.898 * Math.pow(10, 28)],
        densities: [0.001, 0.0001, 0.0001],
        paleOrbitalPaths: true,
        massSlider: {
            min: 3 * Math.pow(10, 10),
            max: 3 * Math.pow(10, 31),
            power: 5
        },
        timeScaleFactor: 3600 * 24 * 1000,
        timeScaleFactorSlider: {
            min: 0,
            max: 3600 * 24 * 500 * 10000,
            power: 5
        },
        positions: [ // in Polar coordinates, r is in meters
            {
                r: 0,
                theta: 0
            },
            {
                r: 7.5 * Math.pow(10, 11),
                theta: -Math.PI/3 - Math.PI/10
            },
            {
                r: 7.78 * Math.pow(10, 11),
                theta: 0
            }
        ],
        velocities: [ // in Polar coordinates, r is in m/s
            {
                r: 0,
                theta: Math.PI/2
            },
            {
                r: 13.3 * Math.pow(10, 3),
                theta: Math.PI/6 - Math.PI/10
            },
            {
                r: 13.1 * Math.pow(10, 3),
                theta: Math.PI/2
            }
        ]
    },
    "Kepler16": {
        masses: [0.6897 * 1.98855 * Math.pow(10, 30), 0.20255 * 1.98855 * Math.pow(10, 30), 0.3333 * 1.898 * Math.pow(10, 27)],
        massSlider: {
            min: 3 * Math.pow(10, 10),
            max: 3 * Math.pow(10, 31),
            power: 5
        },
        timeScaleFactor: 3600 * 24 * 41,
        timeScaleFactorSlider: {
            min: 0,
            max: 3600 * 24 * 500 * 100,
            power: 5
        },
        positions: [ // in Polar coordinates, r is in meters
            {
                r: (0.20255 * 0.22431 * 1.496 * Math.pow(10, 11)) / (0.6897 + 0.20255 ),
                theta: 0
            },
            {
                r: (0.6897 * 0.22431 * 1.496 * Math.pow(10, 11)) / (0.6897 + 0.20255 ),
                theta: Math.PI
            },
            {
                r: 0.7048 * 1.496 * Math.pow(10, 11),
                theta: 0
            }
        ],
        velocities: [ // in Polar coordinates, r is in m/s
            {
                r: 13 * Math.pow(10, 3),
                theta: Math.PI/2
            },
            {
                r: 44 * Math.pow(10, 3),
                theta: 3*Math.PI/2
            },
            {
                r: 33 * Math.pow(10, 3),
                theta: Math.PI/2
            }
        ]
    },
    "Chaotic": {
        dimensionless: true,
        masses: [1, 1, 1],
        massSlider: {
            min: 0.1,
            max: 10,
            power: 3
        },
        timeScaleFactor: 3.9335,
        timeScaleFactorSlider: {
            min: 0.00,
            max: 100,
            power: 3
        },
        positions: [ // in Polar coordinates, r is in meters
            {
                r: 1,
                theta: 0
            },
            {
                r: 1,
                theta: 2*Math.PI/3
            },
            {
                r: 1,
                theta: 4*Math.PI/3
            }
        ],
        velocities: [ // in Polar coordinates, r is in m/s
            {
                r: .55,
                theta: Math.PI/2
            },
            {
                r: .55,
                theta: 2*Math.PI/3 + Math.PI/2
            },
            {
                r: .55,
                theta: 4*Math.PI/3 + Math.PI/2
            }
        ]
    }
}
