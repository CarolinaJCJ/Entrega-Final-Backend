import { userService } from "../services/index.js";
import { generateToken } from "../config/config.jwt.js";
import { transport } from "../utils/mailer.js";

const changeUserRole = async (req, res) => {
    try {

        let role;

        if (req.body.role === 'user') {

            const documents = await userService.getUserDocumentsService(req.user.id);
            const typesNeeded = ['dni', 'domicilio', 'cuenta'];
            const typesFound = documents.map(doc => doc.type);
            const hasAllTypes = typesNeeded.every(type => typesFound.includes(type));

            if (!hasAllTypes) return res.sendUnauthorized('Not authorized')

        };

        (req.body.role === 'user') ? role = 'premium' : role = 'user';

        req.user.role = role;

        const userUpdate = await userService.changeUserService(req.params.uid, role);
        const user = {
            name: `${userUpdate.first_name} ${userUpdate.last_name}`,
            role: role,
            id: userUpdate._id,
            email: userUpdate.email,
            cart: userUpdate.carts[0]
        }
        const token = generateToken(user);

        return res.cookie('authToken', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24,
        }).sendSuccessUser({ userRole: user.role })


    } catch (error) {

        return res.sendInternalError(error)
    }
};


const uploadHandler = async (req, res) => {
    try {

        const { uid } = req.params;
        const { type, document_type } = req.query;



        if (!['profile', 'product', 'document'].includes(type)) {
            return res.sendBadRequest('Invalid type parameter');
        }

        const files = req.files;

        const documents = files.map(file => ({
            name: file.originalname,
            reference: `/uploads/${type}s/${file.filename}`,
            type: document_type
        }));

        const response = await userService.updateUserDocumentsService(uid, type, documents);

        if (response.error) {
            throw new Error(response.error);
        }

        return res.sendSuccess(response);

    } catch (error) {

        return res.sendInternalError(error)
    }
};

const allUsers = async (req, res) => {
    try {
        const result = await userService.getUsersService()
        return res.sendSuccessWithPayload(result)

    } catch (error) {
        return res.sendInternalError(error)
    }
}

const changeRoleByAdmin = async (req, res) => {
    try {
        const userId = req.params.uid
        const { role } = req.body
        let newRole;
        (role === 'premium') ? newRole = 'user' : newRole = 'premium'
        const user = await userService.changeUserService(userId, newRole)

        return res.sendSuccess()
    } catch (error) {
        return res.sendInternalError(error)
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.uid
        
        const result = await userService.deleteUserService(userId)
        
        return res.sendSuccess()
    } catch (error) {
        return res.sendInternalError(error)
    }
}

const userExpired = async (req, res) => {
    try {
        const users = req.body
        if (users) {
            for (const user of users) {
                const html = `<div>
                    <h1>User Expired</h1>
                    <p>Your user was terminated due to inactivity, you will have to register again</p>
                    </div>`
                const result = await transport.sendMail({
                    from: 'BBM',
                    to: user.email,
                    subject: 'User Expired',
                    html: html,
                    attachments: []
                })

                const userDelete = await userService.deleteUserService(user._id)
            }
        }
        // console.log(req.body);
        return res.sendSuccess()
    } catch (error) {
        return res.sendInternalError(error)
    }
}



export default {
    changeUserRole,
    uploadHandler,
    allUsers,
    changeRoleByAdmin,
    deleteUser,
    userExpired
}

