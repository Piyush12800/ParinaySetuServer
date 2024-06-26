const FatherFamily = require('../models/FatherFamily')
const Profile = require('../models/Profile')
const User = require('../models/User')

exports.addFatherFamily = async (req, res) => {
    try {
        const {
            grandFather,
            grandMother,
            grandFatherAge,
            grandMotherAge,
            tau,
            bua,
            chacha
        } = req.body;

        // Ensure the user and profile ID are defined
        if (!req.user || !req.user.additionalDetails) {
            return res.status(400).json({ message: 'User details not found' });
        }

        const profileId = req.user.additionalDetails;
        if (!profileId) {
            return res.status(400).json({ message: 'Profile ID is required' });
        }

        // Check if the profile already has a fatherFamily entry
        const profile = await Profile.findById(profileId).populate('fatherFamily');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        if (profile.fatherFamily) {
            return res.status(400).json({ message: 'Father family details already exist for this profile' });
        }

        // Create new FatherFamily document
        const newFatherFamily = new FatherFamily({
            grandFather,
            grandMother,
            grandFatherAge,
            grandMotherAge,
            tau:tau,
            bua:bua,
            chacha:chacha
        });

        await newFatherFamily.save();

        // Update the Profile document to associate the new FatherFamily
        profile.fatherFamily = newFatherFamily._id;
        await profile.save();

        res.status(200).json({
            message: 'Father Family added and profile updated successfully',
            data: newFatherFamily
        });

    } catch (error) {
        console.error('Error adding father family:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateFatherFamily = async (req, res) => {
    try {
        const { grandFather, grandMother, 
            grandFatherAge, grandMotherAge, 
            tau:tau, bua:bua, chacha:chacha } = req.body;

        // Check if req.user and req.user.additionalDetails are defined
        if (!req.user || !req.user.additionalDetails) {
            return res.status(400).json({ message: 'User details not found' });
        }

        // Retrieve the profile using the additionalDetails reference in the User schema
        const profile = await Profile.findById(req.user.additionalDetails).populate('fatherFamily');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Extract the fatherFamilyId from the profile's fatherFamily field
        const fatherFamilyId = profile.fatherFamily;
        if (!fatherFamilyId) {
            return res.status(400).json({ message: 'Father Family ID is required' });
        }

        // Fetch existing father family data
        const existingFatherFamily = await FatherFamily.findById(fatherFamilyId);
        if (!existingFatherFamily) {
            return res.status(404).json({ message: 'Father Family not found' });
        }

        // Merge existing data with new data
        const updatedData = {
            grandFather: grandFather || existingFatherFamily.grandFather,
            grandMother: grandMother || existingFatherFamily.grandMother,
            grandFatherAge: grandFatherAge || existingFatherFamily.grandFatherAge,
            grandMotherAge: grandMotherAge || existingFatherFamily.grandMotherAge,
            tau: tau || existingFatherFamily.tau,
            bua: bua || existingFatherFamily.bua,
            chacha: chacha || existingFatherFamily.chacha
        };

        // Update the father family information
        const updatedFatherFamily = await FatherFamily.findByIdAndUpdate(
            fatherFamilyId,
            updatedData,
            { new: true }
        );

        return res.status(200).json({
            message: 'Father Family updated successfully',
            data: updatedFatherFamily
        });

    } catch (error) {
        console.error('Error updating father family:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getUserFatherFamily = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('additionalDetails').exec();
        if (!user || !user.additionalDetails) {
            return res.status(404).json({ message: 'Additional details not found' });
        }
        const fatherFamilyId = user.additionalDetails.fatherFamily;
        if (!fatherFamilyId) {
            return res.status(404).json({ message: 'Father Family ID not found in additional details' });
        }
        const fatherFamily = await FatherFamily.findById(fatherFamilyId).exec();
        if (!fatherFamily) {
            return res.status(404).json({ message: 'Father Family not found' });
        }
        return res.status(200).json({ message: 'Father Family fetched successfully', data: fatherFamily });


    } catch (error) {
          res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}