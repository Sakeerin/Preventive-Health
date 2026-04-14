import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';

@Controller('content')
export class ContentController {
    @Get()
    getContent(@Query() query: any) {
        return { data: [], total: 0 };
    }

    @Get(':id')
    getContentById(@Param('id') id: string) {
        return { id, title: 'Sample content' };
    }

    @Post()
    createContent(@Body() body: any) {
        return { id: 'new-id', ...body };
    }

    @Put(':id')
    updateContent(@Param('id') id: string, @Body() body: any) {
        return { id, ...body };
    }
}
