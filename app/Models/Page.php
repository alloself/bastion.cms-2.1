<?php

namespace App\Models;

class Page extends BaseCRUDModel
{
    protected $fillable = ['index', 'meta', 'parent_id', 'template_id'];


}
