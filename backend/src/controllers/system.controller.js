const oracle = require('../configs/oracle');
const OracleDB = require('oracledb');

exports.getStatisticDash = async (req, res, next) => {
	const oracleConnect = await oracle.connect(
		res.locals.user,
		res.locals.password,
	);
	try {
		const sql = `
			BEGIN
				Sp_Analysis_Sa_Dash(:totalSga, :noRole, :noView,:noTable, :noUser, :noOpenedUser, :noLockedUser, :noAdminUser, :noNewUser);
			END;
		`;
		const result = await oracleConnect.execute(sql, {
			totalSga: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
			noRole: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
			noView: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
			noTable: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
			noUser: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
			noOpenedUser: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
			noLockedUser: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
			noAdminUser: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
			noNewUser: { dir: OracleDB.BIND_OUT, type: OracleDB.NUMBER },
		});
		return res.status(200).json({ statisticData: result.outBinds });
	} catch (error) {
		console.error('GET STATISTIC DASH ERROR: ', error);
		return res.status(400).json({ message: 'failed' });
	} finally {
		oracleConnect.close();
	}
};

exports.getUserList = async (req, res, next) => {
	const oracleConnect = await oracle.connect(
		res.locals.user,
		res.locals.password,
	);

	try {
		const sql = `
		SELECT User_Id,
						Username,
						Account_Status,
						Lock_Date,
						Expiry_Date,
						Created,
						Default_Tablespace
		FROM Dba_Users`;
		const result = await oracleConnect.execute(sql);
		return res.status(200).json({ userList: result.rows });
	} catch (error) {
		console.error('GET USER LIST ERROR: ', error);
		return res.status(400).json({ message: 'failed' });
	} finally {
		oracleConnect.close();
	}
};

exports.getDetailUser = async (req, res, next) => {
	const oracleConnect = await oracle.connect(
		res.locals.user,
		res.locals.password,
	);
	try {
		const { userId } = req.query;
		const sql = `
								SELECT User_Id,
											Username,
											Account_Status,
											Lock_Date,
											Expiry_Date,
											Created,
											Default_Tablespace,
											Temporary_Tablespace,
											Profile,
											Authentication_Type
								FROM Dba_Users WHERE USER_ID = ${userId}`;
		const result = await oracleConnect.execute(sql);
		if (result) return res.status(200).json({ user: result.rows[0] });
	} catch (error) {
		console.error('GET DETAIL USER ERROR: ', error);
		return res.status(400).json({ message: 'failed' });
	} finally {
		oracleConnect.close();
	}
};
