import {Injectable} from "@angular/core";
import {UserResource} from 'core-app/modules/hal/resources/user-resource';
import {CollectionResource} from 'core-app/modules/hal/resources/collection-resource';
import {PriorityBoardHeaderComponent} from "core-app/modules/boards/board/board-actions/priority/priority-board-header.component";
import {ProjectResource} from "core-app/modules/hal/resources/project-resource";
import {CachedBoardActionService} from "core-app/modules/boards/board/board-actions/cached-board-action.service";
import {HalResource} from "core-app/modules/hal/resources/hal-resource";
import {Board} from "core-app/modules/boards/board/board";
import {ApiV3Filter, ApiV3FilterBuilder} from "core-components/api/api-v3/api-v3-filter-builder";
import {QueryResource} from "core-app/modules/hal/resources/query-resource";
import {ImageHelpers} from "core-app/helpers/images/path-helper";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class BoardPriorityActionService extends CachedBoardActionService {
  filterName = 'priority';

  text = this.I18n.t('js.boards.board_type.action_type.priority');

  description = this.I18n.t('js.boards.board_type.action_text_priority');

  label = this.I18n.t('js.boards.add_list_modal.labels.priority');

  icon = 'icon-user';

  image = ImageHelpers.imagePath('board_creation_modal/priority.svg');

  readonly noPriority:any = {
    id: null,
    href: null,
    name: this.I18n.t('js.filter.noneElement')
  };

  public addInitialColumnsForAction(board:Board):Promise<Board> {
    return this
      .loadValues()
      .toPromise()
      .then((results) =>
        Promise.all<unknown>(
          results.map((priority:HalResource) => {

            if (priority.isDefault) {
              return this.addColumnWithActionAttribute(board, priority);
            }

            return Promise.resolve(board);
          })
        )
          .then(() => board)
      );
  }
  /**
   * Returns the current filter value if any
   * @param query
   * @returns The loaded action reosurce
   */

  getLoadedActionValue(query:QueryResource):Promise<HalResource|undefined> {
    const filter = this.getActionFilter(query);
    if (filter && filter.operator.id === '!*') {
      return Promise.resolve(this.noPriority);
    }

    return super.getLoadedActionValue(query);
  }

  public get localizedName() {
    return this.I18n.t('js.work_packages.properties.priority');
  }

  public headerComponent() {
    return PriorityBoardHeaderComponent;
  }

  protected loadUncached():Promise<HalResource[]> {
    let filters = new ApiV3FilterBuilder();
    filters.add('1', '=', true);
    return this.apiV3Service.priorities.filtered(filters).get().toPromise().then(
      (collection:CollectionResource<HalResource>) => collection.elements
    );
  }
}
