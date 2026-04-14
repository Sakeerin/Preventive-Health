import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';

@Controller('admin/ai-models')
export class ModelRegistryController {
    @Get()
    getModels() {
        return {
            data: [
                {
                    id: 'model-v1',
                    version: '1.0.0',
                    description: 'Initial risk model',
                    isActive: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'model-v2',
                    version: '2.0.0',
                    description: 'Updated with sleep metrics',
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ]
        };
    }

    @Post()
    createModel(@Body() body: any) {
        return { id: 'new-model-id', ...body };
    }

    @Put(':id/activate')
    activateModel(@Param('id') id: string) {
        return { success: true, activeModelId: id };
    }
}
