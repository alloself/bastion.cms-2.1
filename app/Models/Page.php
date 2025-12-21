<?php

namespace App\Models;

class Page extends CRUDModel    
{
    protected $fillable = ['index', 'meta', 'parent_id', 'template_id'];
}
