import CustomCollapse, { type CollapseProps } from '@/theme/theme-elements/data-display/CustomCollapse';

export type { CollapseProps };

export function Collapse( props: CollapseProps )
{
    return <CustomCollapse {...props} />;
}

export default Collapse;
