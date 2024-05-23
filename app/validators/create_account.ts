import vine from '@vinejs/vine'


export const createAccountValidator = vine.compile(
    vine.object({
        email: vine.string().trim().email(),
        password: vine
            .string()
            .trim()
            .minLength(4)
            .maxLength(32)
    })
)