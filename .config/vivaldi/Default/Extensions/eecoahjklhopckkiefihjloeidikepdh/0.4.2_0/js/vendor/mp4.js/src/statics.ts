module Mp4 {

  export var BOX_TYPE_FILE_TYPE_BOX = 'ftyp';
  export var BOX_TYPE_MOVIE_BOX = 'moov';
  export var BOX_TYPE_MEDIA_DATA_BOX = 'mdat';
  export var BOX_TYPE_MOVIE_HEADER_BOX = 'mvhd';
  export var BOX_TYPE_TRACK_BOX = 'trak';
  export var BOX_TYPE_TRACK_HEADER_BOX = 'tkhd';
  export var BOX_TYPE_TRACK_REFERENCE_BOX = 'tref';
  export var BOX_TYPE_HINT_TRACK_REFERENCE_TYPE_BOX = 'hint';
  export var BOX_TYPE_DISCRIBE_TRACK_REFERENCE_TYPE_BOX = 'cdsc';
  export var BOX_TYPE_MEDIA_BOX = 'mdia';
  export var BOX_TYPE_MEDIA_HEADER_BOX = 'mdhd';
  export var BOX_TYPE_HANDLER_BOX = 'hdlr';
  export var BOX_TYPE_MEDIA_INFORMATION_BOX = 'minf';
  export var BOX_TYPE_VIDEO_MEDIA_HEADER_BOX = 'vmhd';
  export var BOX_TYPE_SOUND_MEDIA_HEADER_BOX = 'smhd';
  export var BOX_TYPE_HINT_MEDIA_HEADER_BOX = 'hmhd';
  export var BOX_TYPE_NULL_MEDIA_HEADER_BOX = 'nmhd';
  export var BOX_TYPE_DATA_INFORMATION_BOX = 'dinf';
  export var BOX_TYPE_DATA_REFERENCE_BOX = 'dref';
  export var BOX_TYPE_DATA_ENTRY_URL_BOX = 'url ';
  export var BOX_TYPE_DATA_ENTRY_URN_BOX = 'urn ';
  export var BOX_TYPE_SAMPLE_TABLE_BOX = 'stbl';
  export var BOX_TYPE_TIME_TO_SAMPLE_BOX = 'stts';
  export var BOX_TYPE_COMPOSITION_OFFSET_BOX = 'ctts';
  export var BOX_TYPE_ES_DESCRIPTOR_BOX = 'esds';
  export var BOX_TYPE_MP4_VISUAL_SAMPLE_ENTRY = 'mp4v';
  export var BOX_TYPE_MP4_AUDIO_SAMPLE_ENTRY = 'mp4a';
  export var BOX_TYPE_MPEG_SAMPLE_ENTRY = 'mp4s';
  export var BOX_TYPE_SAMPLE_DESCRIPTION_BOX = 'stsd';
  export var BOX_TYPE_SAMPLE_SIZE_BOX = 'stsz';
  export var BOX_TYPE_SAMPLE_TO_CHUNK_BOX = 'stsc';
  export var BOX_TYPE_CHUNK_OFFSET_BOX = 'stco';
  export var BOX_TYPE_SYNC_SAMPLE_BOX = 'stss';
  export var BOX_TYPE_SHADOW_SYNC_SAMPLE_BOX = 'stsh';
  export var BOX_TYPE_DEGRADATION_PRIORITY_BOX = 'stdp';
  export var BOX_TYPE_PADDING_BITS_BOX = 'padb';
  export var BOX_TYPE_FREE_SPACE_BOX = 'free';
  export var BOX_TYPE_SKIP_BOX = 'skip';
  export var BOX_TYPE_EDIT_BOX = 'edts';
  export var BOX_TYPE_EDIT_LIST_BOX = 'elst';
  export var BOX_TYPE_COPYRIGHT_BOX = 'cprt';
  export var BOX_TYPE_MOVIE_EXTENDS_BOX = 'mvex';
  export var BOX_TYPE_MOVIE_EXTENDS_HEADER_BOX = 'mehd';
  export var BOX_TYPE_TRACK_EXTENDS_BOX = 'trex';
  export var BOX_TYPE_MOVIE_FLAGMENT_BOX = 'moof';
  export var BOX_TYPE_MOVIE_FRAGMENT_HEADER_BOX = 'mfhd';
  export var BOX_TYPE_TRACK_FRAGMENT_BOX = 'traf';
  export var BOX_TYPE_TRACK_FRAGMENT_HEADER_BOX = 'tfhd';
  export var BOX_TYPE_TRACK_RUN_BOX = 'trun';
  export var BOX_TYPE_TRACK_FRAGMENT_RANDOM_ACCESS_BOX = 'tfra';
  export var BOX_TYPE_MOVIE_FRAGMENT_RANDOM_ACCESS_OFFSET_BOX = 'mfro';
  export var BOX_TYPE_SAMPLE_DEPENDENCY_TYPE_BOX = 'sdtp';
  export var BOX_TYPE_SAMPLE_TO_GROUPE_BOX = 'sbgp';
  export var BOX_TYPE_SAMPLE_GROUP_DESCRIPTION_BOX = 'sgpd';
  export var BOX_TYPE_ROLL_RECOVERY_ENTRY = 'roll';
  export var BOX_TYPE_SAMPLE_SCALE_BOX = 'stsl';
  export var BOX_TYPE_SUB_SAMPLE_INFORMATION_BOX = 'subs';
  export var BOX_TYPE_PROGRESSIVE_DOWNLOAD_INFO_BOX = 'pdin';
  export var BOX_TYPE_META_BOX = 'meta';
  export var BOX_TYPE_XML_BOX = 'xml ';
  export var BOX_TYPE_BINARY_XML_BOX = 'bxml';
  export var BOX_TYPE_ITEM_LOCATION_BOX = 'iloc';
  export var BOX_TYPE_PRIMARY_ITEM_BOX = 'pitm';
  export var BOX_TYPE_ITEM_PROTECTION_BOX = 'ipro';
  export var BOX_TYPE_ITEM_INFO_ENTRY = 'infe';
  export var BOX_TYPE_ITEM_INFO_BOX = 'iinf';
  export var BOX_TYPE_PROTECTION_SCHEME_INFO_BOX = 'sinf';
  export var BOX_TYPE_ORIGINAL_FORMAT_BOX = 'frma';
  export var BOX_TYPE_IPMP_INFO_BOX = 'imif';
  export var BOX_TYPE_IPMP_CONTROL_BOX = 'impc';

  export var DESCR_TAG_ES_DESCRIPTOR = 0x03;
  export var DESCR_TAG_DECODER_CONFIG_DESCRIPTOR = 0x04;
  export var DESCR_TAG_DECODER_SPECIFIC_INFO = 0x05;
  export var DESCR_TAG_SL_CONFIG_DESCRIPTOR = 0x06;
  export var DESCR_TAG_PROFILE_LEVEL_INDICATION_INDEX_DESCRIPTOR = 0x14;

}