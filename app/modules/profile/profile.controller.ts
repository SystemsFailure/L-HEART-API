import Profile from "#models/profile";
import User from "#models/user";
import { updateValidator } from "#validators/profile/update";
import { HttpContext } from "@adonisjs/core/http";

export default class ProfileController {

    // Врядле будет использоваться, т.к через подгрузку связанных с account данных можно пользоваться
    public async index({response} : HttpContext) {
        try {
            const profiles: Profile[] = await Profile.all()
            return response.apiSuccess(profiles)
        } catch (error) {
            return response.status(500).json({ error: 'Something went wrong' })
        }
    }

    public async create({ request, response }: HttpContext) {
        const account = request.account
        try {
            // rem: Здесь получать данные профиля прогоняя их через валидацию.
            // Так же предусмотреть тип для результата валидации.
            const profileData = request.input('profile');
            if(!profileData) {
                console.error('Data for profile not found in body request');
                return response.apiError('Data for profile not found in body request', '', false);
            }
            const profile: Profile = await Profile.create({
                ...profileData
            });

            if (!account) {
                return response.status(401).json({ error: 'This user is not unauthorized' });
            }

            // Создаем ассоциацию user
            await User.create({
                account_id: account.id,
                profile_id: profile.id
            });

            return response.apiSuccess(profile);
        } catch (error) {
          return response.status(500).json({ error: 'Unable to create profile' })
        }
    }

    public async update({request, response, params }: HttpContext) {
        const profileId = params.id; // Получаем ID профиля из параметров маршрута
        const dataToUpdate = request.only([
            'education', 
            'description', 
            'sex',
            'dateBirth',
            'growth',
            'weight',
            'children',
            'applicationActivity',
            'profession',
            'religious',
            'eyeColor',
        ]); // Получаем только те поля, которые нужно обновить
        // const payload = await updateValidator.validate(dataToUpdate)
        try {
            const accountId: number | undefined = request.account?.id;
      
            if (!accountId) {
              console.debug('accountId является пустой либо не валидный');
              return response.apiError('accountId is not valid');
            }
      
            if (!profileId) {
              console.debug('profileId является пустой либо не валидный');
              return response.apiError('profileId is not valid');
            }
      
            console.log(dataToUpdate, profileId, accountId);
      
            const profile: Profile | null = await Profile.query()
              .whereHas('accounts', (q) => {
                q.where('accounts.id', accountId);
              })
              .where('id', profileId)
              .first();
      
            if (!profile) {
              console.debug('Profile с данным id не найден');
              return response.apiError('profile not found');
            }
      
            profile.merge(dataToUpdate); // Объединяем новые данные с существующими
            await profile.save(); // Сохраняем изменения
      
            return response.apiSuccess(profile);
          } catch (error) {
            if (error.messages) {
              return response.status(422).json({ error: 'Validation Error', messages: error.messages });
            }
      
            return response.status(500).json({ error: error.message || error });
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