import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard, SessionAuthGuard } from '../auth';

interface ContentQuery {
    category?: string;
    status?: string;
    page?: string;
    limit?: string;
}

interface CreateContentDto {
    title: string;
    body: string;
    category: string;
    status?: 'draft' | 'published' | 'archived';
    tags?: string[];
}

interface UpdateContentDto {
    title?: string;
    body?: string;
    category?: string;
    status?: 'draft' | 'published' | 'archived';
    tags?: string[];
}

@Controller('content')
export class ContentController {
    @Get()
    getContent(@Query() query: ContentQuery) {
        return { data: [], total: 0 };
    }

    @Get(':id')
    getContentById(@Param('id') id: string) {
        return { id, title: 'Sample content' };
    }

    @Post()
    @UseGuards(SessionAuthGuard, RolesGuard)
    @Roles('admin')
    createContent(@Body() body: CreateContentDto) {
        return { id: 'new-id', ...body };
    }

    @Put(':id')
    @UseGuards(SessionAuthGuard, RolesGuard)
    @Roles('admin')
    updateContent(@Param('id') id: string, @Body() body: UpdateContentDto) {
        return { id, ...body };
    }
}
