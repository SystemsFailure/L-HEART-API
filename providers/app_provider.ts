import { ApplicationService } from '@adonisjs/core/types'

export default class AppProvider {
    constructor(protected app: ApplicationService) {}

    register() {}
    
    async boot() {
        await import('../extensions.js')
    }
  }