import Profile from "#models/profile";
import User from "#models/user";
// import { updateValidator } from "#validators/profile/update";
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

    // ps: Данный маршрут вприцнепе не нужен, ибо профиль отдельно от аккаунта удалить нельзя, только если удаляется аккаунт -
    // то удаление происходит через общую таблицу users, и каскадно удаляется все остальное и профиль и аккаунт связанные с этой записью
    public async delete({ params, response, auth }: HttpContext) {
        try {
            // Получаем ID профиля из параметров маршрута
            const profileId = params.id;

            // Проверка на валидный UUID (предполагая, что ID профиля - это UUID)
            if (!this.isValidUUID(profileId)) {
                return response.status(400).json({ error: 'Invalid profile ID format' });
            }

            // Проверка, существует ли профиль
            const profile: Profile | null = await Profile.query().where('profile.id', profileId).preload('users').firstOrFail();
            if (!profile) {
                return response.status(404).json({ error: 'Profile not found' });
            }

            // Проверка прав доступа (если применимо)
            if (auth.user!.id !== profile.users[0].id) {
                return response.status(403).json({ error: 'You do not have permission to delete this profile' });
            }

            // Удаляем профиль
            await profile.delete();

            // Возвращаем успешный ответ
            return response.apiSuccess({ message: 'Profile deleted successfully' });
        } catch (error) {

            // Различные типы ошибок могут быть обработаны здесь (например, ошибка базы данных)
            if (error.name === 'ModelNotFoundException') {
                return response.status(404).json({ error: 'Profile not found' });
            }

            return response.status(500).json({ error: 'Unable to delete profile' });
        }
    }

    // Простой метод для проверки валидности UUID
    private isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
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