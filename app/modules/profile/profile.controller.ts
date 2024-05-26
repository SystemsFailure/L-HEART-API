import Account from "#models/account";
import Profile from "#models/profile";
import User from "#models/user";
import { AccessToken } from "@adonisjs/auth/access_tokens";
import { HttpContext } from "@adonisjs/core/http";

export default class ProfileController {

    public async index({auth, response} : HttpContext) {
        await auth.use('api').authenticate()
        try {
            const profiles: Profile[] = await Profile.all()
            return response.apiSuccess(profiles)
        } catch (error) {
            return response.status(500).json({ error: 'Something went wrong' })
        }
    }

    public async create({ auth, request, response }: HttpContext) {
        await auth.use('api').authenticate()
        try {
            const profile: Profile = await Profile.create({})

            const account: (Account & {
                currentAccessToken: AccessToken;
            }) | undefined = auth.user;

            if (!account) {
                return response.status(401).json({ error: 'This user is not unauthorized' });
            }

            await User.create({
                account_id: account.id,
                profile_id: profile.id
            });

            return response.apiSuccess(profile);
        } catch (error) {
          return response.status(500).json({ error: 'Unable to create profile' })
        }
    }

    public async update({auth, request, response, params }: HttpContext) {
        await auth.use('api').authenticate()
        try {
            const profileId = params.id; // Получаем ID профиля из параметров маршрута
            const dataToUpdate = request.only(['education', 'description', 'sex']); // Получаем только те поля, которые нужно обновить

            const profile: Profile = await Profile.findOrFail(profileId); // Находим профиль по ID или возвращаем 404

            profile.merge(dataToUpdate); // Объединяем новые данные с существующими
            await profile.save(); // Сохраняем изменения

            return response.apiSuccess(profile);
        } catch (error) {
            return response.status(500).json({ error: 'Unable to update profile' });
        }
    }

    public async delete({ params, response }: HttpContext) {
        try {
            const profileId = params.id; // Получаем ID профиля из параметров маршрута

            const profile: Profile = await Profile.findOrFail(profileId); // Находим профиль по ID или возвращаем 404

            await profile.delete(); // Удаляем профиль

            return response.apiSuccess({ message: 'Profile deleted successfully' });
        } catch (error) {
            return response.status(500).json({ error: 'Unable to delete profile' });
        }
    }

    // для объединения с users по id профиля и id аккаунта
    private async bind() {

    }
}


// Это пример для проверки при создании нового профиля
    // Define the validation schema
    // const profileSchema = BaseSchema.create({
    //   dateBirth: schema.date({ format: 'yyyy-MM-dd' }, [
    //     rules.required()
    //   ]),
    //   sex: schema.string({}, [
    //     rules.required(),
    //     rules.maxLength(1),
    //   ]),
    //   growth: schema.number([
    //     rules.required()
    //   ]),
    //   weight: schema.number([
    //     rules.required()
    //   ]),
    //   children: schema.string.optional(),
    //   applicationActivity: schema.number([
    //     rules.required()
    //   ]),
    //   profession: schema.string.optional(),
    //   education: schema.string.optional(),
    //   religious: schema.string.optional(),
    //   eyeColor: schema.string.optional(),
    //   description: schema.string.optional()
    // })

    // Validate request data against the schema
    // const payload = await request.validate({ schema: profileSchema })