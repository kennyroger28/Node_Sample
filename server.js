// IMPORTS
const express   = require("express");
const sql       = require("mssql");
const bodyparser= require("body-parser");
require("custom-env").env("dev");

// EXPRESS CONFIG
const app = express();
const port = 3028;
app.use(bodyparser.json());

// CREDENTIALS
var dbConfig = {
	server: process.env.SERVER,
	port: 1433,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
	connectionTimeout: 150000,
	driver: 'tedious',
	stream: false,
	options: {
		encrypt: false
	},
	pool: {
		max: 20,
		min: 0,
		idleTimeoutMillis: 60000
	}
}

// EXPRESS ROUTES
app.get("/GetEmployees", (req, res) => {
    var connectionPool = new sql.ConnectionPool(dbConfig)
        .on('error', onerror => {console.log("Error in Pool " + err );})
        .connect() 
        .then( pool => {
             pool.query("SELECT * FROM APP_Employee")
                .then( result => {
                console.log(result);
                res.send(result.recordset);
                })
                .catch( err => {
                    console.log(err);
                });
        });
})
//DELETE RECORD
app.post("/DeleteEmployees", (req, res) => {
    var connectionPool = new sql.ConnectionPool(dbConfig)
        .on('error', onerror => {console.log("Error in Pool " + err );})
        .connect() 
        .then( pool => {
            pool.query(`DELETE FROM APP_Employee WHERE Code = 
            '${req.body.Code}'`)
                .then( result => {
                console.log(result);
                res.send(result.recordset);
                })
                .catch( err => {
                    console.log(err);
                });
        });
})
//INSERT RECORD
app.post("/InsertUpdateEmployee", async (req, res) => {
    var oData = req.body;
    var sDML = "";

    if (oData.IsUpdate ) {
        sDML = `UPDATE APP_Employee SET `;
        for(var i = 0; i < Object.keys(oData).length; i++){
            var key = Object.keys(oData)[i];
            if (key === "Code" || key === "IsUpdate") continue;
            sDML += key + " = '" +  oData[key] + "', ";
        }

        sDML += "UpdatedDate = CURRENT_TIMESTAMP, UpdatedBy = 'manager' ";
        sDML += `WHERE Code = '${oData.Code}'`;
        
    } else  {
        sDML = `INSERT INTO APP_Employee (Code, EmployeeCode, FirstName, MiddleName, LastName, 
            BirthDate, YearOfExp, DesiredSalary, CreatedBy, CreatedDate)
            VALUES ('${oData.Code}', '${oData.EmployeeCode}', '${oData.FirstName}', 
                '${oData.MiddleName}','${oData.LastName}','${oData.BirthDate}', 
                ${oData.YearOfExp}, ${oData.DesiredSalary}, '${oData.CreatedBy}', 
                '${oData.CreatedDate}')`;
    }

    var connectionPool = new sql.ConnectionPool(dbConfig)
        .on('error', onerror => {console.log("Error in Pool " + err );})
        .connect() 
        .then( pool => {
             pool.query(sDML)
                .then( result => {
                console.log(result);
                res.send(result.recordset);
                })
                .catch( err => {
                    console.log(err);
                });
        });
})

app.post("/DoRollBack", async (req, res) =>
{

})

// EXPRESS PORT
app.listen(port, () => {
    console.log("Web Service is running on port " + port);
});