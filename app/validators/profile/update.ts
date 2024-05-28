import vine from '@vinejs/vine'

export const updateValidator = vine.compile(
    vine.object({
        education: vine.string().optional(),
        description: vine.string().optional(),
        sex: vine.string().optional(),
        dateBirth: vine.date().optional(),
        growth: vine.number().optional(),
        weight: vine.number().optional(),
        children: vine.string().optional(),
        applicationActivity: vine.number().optional(),
        profession: vine.string().optional(),
        religious: vine.string().optional(),
        eyeColor: vine.string().optional(),
    })
)